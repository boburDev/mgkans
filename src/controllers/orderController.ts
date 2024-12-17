import axios from 'axios';
import { Request, Response } from 'express';
import { accessToken } from '../utils/getAccessToken';
import { fetchMetaDetails } from '../utils/fetchMetaDetails';

const MOYSKLAD_BASE_URL = 'https://api.moysklad.ru/api/remap/1.2';
const MOYSKLAD_HEADERS = {
    'Authorization': `Basic ${Buffer.from(`${process.env.LOGIN}:${process.env.PASSWORD}`).toString('base64')}`,
    'Content-Type': 'application/json',
};
const ORGANIZATION_ID = ''

export const createOrder = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId, items } = req.body;

        // Validate required fields
        if (!userId || !items || items.length === 0 || !ORGANIZATION_ID) {
            return res.status(400).json({
                message: 'Invalid input: userId, items, and organizationId are required.',
            });
        }

        // Calculate total amount
        const totalAmount = items.reduce(
            (sum: number, item: any) => sum + item.quantity * item.price,
            0
        );

        // Format items for MoySklad API
        const positions = items.map((item: any) => ({
            assortment: { 
                meta: { 
                    href: `${MOYSKLAD_BASE_URL}/entity/product/${item.productId}`,
                    type: 'product', // Add the type field
                } 
            },
            quantity: item.quantity,
            price: item.price * 100, // MoySklad uses prices in cents
        }));
        

        // Construct the payload for the API request
        const payload = {
            organization: {
                meta: {
                    href: `${MOYSKLAD_BASE_URL}/entity/organization/${ORGANIZATION_ID}`,
                    type: 'organization',
                    mediaType: 'application/json',
                },
            },
            agent: {
                meta: {
                    href: `${MOYSKLAD_BASE_URL}/entity/counterparty/${userId}`,
                    type: 'counterparty',
                    mediaType: 'application/json',
                },
            },
            positions,
            sum: totalAmount * 100, // MoySklad uses sums in cents
        };

        // Send the request to create the order
        const response = await axios.post(
            `${MOYSKLAD_BASE_URL}/entity/customerorder`,
            payload,
            { headers: MOYSKLAD_HEADERS }
        );

        // Respond with success
        res.status(200).json({
            data: response.data,
            error: false,
            message: 'Order created successfully.',
        });
    } catch (error: any) {
        console.error('Error creating order:', error);
        res.status(500).json({
            message: 'Error creating order',
            error: error.response?.data || error.message,
        });
    }
};


export const getUserOrders = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'Invalid input: userId is required.' });
        }

        // Fetch orders for the specific user
        const response: any = await axios.get(`${MOYSKLAD_BASE_URL}/entity/customerorder`, {
            headers: MOYSKLAD_HEADERS,
            params: {
                filter: `agent=https://api.moysklad.ru/api/remap/1.2/entity/counterparty/${userId}`,
            },
        });

        const orders = response.data.rows;

        // Enrich orders with additional details (positions and state)
        const enrichedOrders = await Promise.all(
            orders.map(async (order: any) => {
                // Fetch positions for the order
                const positionsResponse:any = await axios.get(order.positions.meta.href, {
                    headers: MOYSKLAD_HEADERS,
                });
                const positions = positionsResponse.data.rows;

                return {
                    id: order.id,
                    name: order.name,
                    moment: order.moment,
                    sum: order.sum / 100, // Convert cents to standard currency
                    state: order.state?.meta?.href || null,
                    created: order.created,
                    updated: order.updated,
                    vatEnabled: order.vatEnabled,
                    vatIncluded: order.vatIncluded,
                    vatSum: order.vatSum / 100 || 0, // Convert cents to standard currency
                    printed: order.printed,
                    published: order.published,
                    applicable: order.applicable,
                    positions: positions.map((position: any) => ({
                        product: position.assortment.meta.href,
                        quantity: position.quantity,
                        price: position.price / 100, // Convert cents to standard currency
                    })),
                };
            })
        );

        res.status(200).json({ data: enrichedOrders, error: false, message: 'User orders fetched successfully.' });
    } catch (error: any) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Error fetching user orders', error: error.response?.data || error.message });
    }
};

export const getAllOrders = async (req: Request, res: Response): Promise<any> => {
    try {
        // Fetch customer orders
        const response:any = await axios.get(`${MOYSKLAD_BASE_URL}/entity/customerorder`, {
            headers: MOYSKLAD_HEADERS,
        });

        const orders = response.data.rows;
        

        // Enrich orders with additional details like positions and state
        const enrichedOrders = await Promise.all(
            orders.map(async (order: any) => {
                // Fetch positions for the order
                const positionsResponse:any = await axios.get(order.positions.meta.href, {
                    headers: MOYSKLAD_HEADERS,
                });
                const positions = positionsResponse.data.rows;

                // Map enriched order
                return {
                    id: order.id,
                    name: order.name,
                    description: order.description || null,
                    moment: order.moment,
                    sum: order.sum / 100,
                    vatSum: order.vatSum / 100, // Convert cents to standard currency
                    payedSum: order.payedSum / 100, // Convert cents to standard currency
                    shippedSum: order.shippedSum / 100, // Convert cents to standard currency
                    invoicedSum: order.invoicedSum / 100, // Convert cents to standard currency
                    reservedSum: order.reservedSum / 100, // Convert cents to standard currency
                    created: order.created,
                    updated: order.updated,
                    printed: order.printed,
                    published: order.published,
                    agent: order.agent?.meta?.href || null,
                    organization: order.organization?.meta?.href || null,
                    positions: positions.map((position: any) => ({
                        product: position.assortment.meta.href,
                        quantity: position.quantity,
                        price: position.price / 100, // Convert cents to standard currency
                    })),
                };
            })
        );

        res.status(200).json({ data: enrichedOrders, error: false, message: 'Orders fetched successfully.' });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.response?.data || error.message });
    }
};
