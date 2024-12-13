import axios from 'axios';
import { Request, Response } from 'express';
import {accessToken} from '../utils/getAccessToken';
import { fetchMetaDetails } from '../utils/fetchMetaDetails';

const MOYSKLAD_BASE_URL = 'https://api.moysklad.ru/api/remap/1.2';
const MOYSKLAD_HEADERS = {
    'Authorization': `Basic ${Buffer.from(`${process.env.LOGIN}:${process.env.PASSWORD}`).toString('base64')}`,
    'Content-Type': 'application/json',
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { userId, items } = req.body;

        // Calculate totalAmount from items
        const totalAmount = items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);

        // Format items for MoySklad API
        const positions = items.map((item: any) => ({
            assortment: { meta: { href: `${MOYSKLAD_BASE_URL}/entity/product/${item.productId}` } },
            quantity: item.quantity,
            price: item.price * 100, // MoySklad expects prices in cents
        }));

        // Prepare payload for creating a Customer Order
        const payload = {
            organization: { meta: { href: `${MOYSKLAD_BASE_URL}/entity/organization/<YOUR_ORGANIZATION_ID>` } },
            agent: { meta: { href: `${MOYSKLAD_BASE_URL}/entity/counterparty/${userId}` } },
            positions,
            sum: totalAmount * 100,
        };

        // Send request to create an order in MoySklad
        const response = await axios.post(`${MOYSKLAD_BASE_URL}/entity/customerorder`, payload, { headers: MOYSKLAD_HEADERS });

        res.json({ data: response.data, error: false, message: null });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error });
    }
};

export const getUserOrders = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Fetch orders for the user
        const response:any = await axios.get(`${MOYSKLAD_BASE_URL}/entity/customerorder`, {
            headers: MOYSKLAD_HEADERS,
            params: {
                filter: `agent=https://api.moysklad.ru/api/remap/1.2/entity/counterparty/${userId}`,
            },
        });

        res.json({ data: response.data.rows, error: false, message: null });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Error fetching user orders', error });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, userId, status, sort = 'moment', order = 'desc' } = req.query;

        const filterParams: string[] = [];
        if (userId) {
            filterParams.push(`agent=https://api.moysklad.ru/api/remap/1.2/entity/counterparty/${userId}`);
        }
        if (status) {
            filterParams.push(`state.name=${status}`);
        }

        const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

        const token = await accessToken();

        const response:any = await axios.get(`${MOYSKLAD_BASE_URL}/entity/customerorder`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            params: {
                filter: filterParams.join(';'),
                offset,
                limit: parseInt(limit as string, 10),
                orderBy: `${sort},${order}`,
            },
        });

        const orders = response.data.rows;

        // Extract relevant fields and resolve meta details
        const detailedOrders = await Promise.all(
            orders.map(async (order: any) => {
                const { id, name, description, moment, sum, vatSum, applicable, state, agent, positions, created } = order;

                // Fetch meta details
                const stateDetails:any = state?.meta?.href ? await fetchMetaDetails(state.meta.href, token) : null;
                const agentDetails:any = agent?.meta?.href ? await fetchMetaDetails(agent.meta.href, token) : null;
                const positionDetails:any = positions?.meta?.href
                    ? await fetchMetaDetails(positions.meta.href, token)
                    : null;

                return {
                    id,
                    name,
                    description,
                    moment,
                    sum,
                    vatSum,
                    applicable,
                    created,
                    state: stateDetails ? { id: stateDetails.id, name: stateDetails.name } : null,
                    agent: agentDetails ? { id: agentDetails.id, name: agentDetails.name } : null,
                    positions: positionDetails?.rows || [],
                };
            })
        );

        const totalOrders = response.data.meta.size;
        const totalPages = Math.ceil(totalOrders / parseInt(limit as string, 10));

        res.status(200).json({
            totalOrders,
            currentPage: page,
            totalPages,
            pageSize: limit,
            orders: detailedOrders,
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};
