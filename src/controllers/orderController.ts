import axios from 'axios';
import { Request, Response } from 'express';

const MOYSKLAD_BASE_URL = 'https://api.moysklad.ru/api/remap/1.2';
const MOYSKLAD_HEADERS = {
    'Authorization': `Basic ${Buffer.from(`${process.env.LOGIN}:${process.env.PASSWORD}`).toString('base64')}`,
    'Content-Type': 'application/json',
};
const ORGANIZATION_ID = process.env.ORGANIZATION_ID

export const createOrder = async (req: Request, res: Response): Promise<any> => {
    try {
        const { items } = req.body;

        if (!req?.user?.isLegal) throw new Error("User is not legal");
        
        if (!items || items.length === 0 || !ORGANIZATION_ID) {
            return res.status(400).json({
                message: 'Invalid input: items, and organizationId are required.',
            });
        }
        const userId = req.user.userLegal.conterAgentId

        if (!userId) {
            res.status(400).json({ message: 'conterAgentId is required' });
            return;
        }
        
        const totalAmount = items.reduce(
            (sum: number, item: any) => sum + item.quantity * item.price,
            0
        );

        const positions = items.map((item: any) => ({
            assortment: { 
                meta: { 
                    href: `${MOYSKLAD_BASE_URL}/entity/product/${item.productId}`,
                    type: 'product', 
                } 
            },
            quantity: item.quantity,
            price: item.price * 100, 
        }));
        
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
            sum: totalAmount * 100, 
        };

        
        const response = await axios.post(
            `${MOYSKLAD_BASE_URL}/entity/customerorder`,
            payload,
            { headers: MOYSKLAD_HEADERS }
        );

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
        if (!req?.user?.isLegal) throw new Error("User is not legal");
        const userId = req.user.userLegal.conterAgentId

        if (!userId) {
            return res.status(400).json({ message: 'Invalid input: userId is required.' });
        }

        const response: any = await axios.get(`${MOYSKLAD_BASE_URL}/entity/customerorder`, {
            headers: MOYSKLAD_HEADERS,
            params: {
                filter: `agent=https://api.moysklad.ru/api/remap/1.2/entity/counterparty/${userId}`,
            },
        });

        const orders = response.data.rows;

        const enrichedOrders = await Promise.all(
            orders.map(async (order: any) => {
                
                const positionsResponse:any = await axios.get(order.positions.meta.href, {
                    headers: MOYSKLAD_HEADERS,
                });
                const positions = positionsResponse.data.rows;

                return {
                    id: order.id,
                    name: order.name,
                    moment: order.moment,
                    sum: order.sum / 100, 
                    state: order.state?.meta?.href || null,
                    created: order.created,
                    updated: order.updated,
                    vatEnabled: order.vatEnabled,
                    vatIncluded: order.vatIncluded,
                    vatSum: order.vatSum / 100 || 0, 
                    printed: order.printed,
                    published: order.published,
                    applicable: order.applicable,
                    positions: positions.map((position: any) => ({
                        product: position.assortment.meta.href,
                        quantity: position.quantity,
                        price: position.price / 100, 
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
        
        const response:any = await axios.get(`${MOYSKLAD_BASE_URL}/entity/customerorder`, {
            headers: MOYSKLAD_HEADERS,
        });

        const orders = response.data.rows;
        
        const enrichedOrders = await Promise.all(
            orders.map(async (order: any) => {
                
                const positionsResponse:any = await axios.get(order.positions.meta.href, {
                    headers: MOYSKLAD_HEADERS,
                });
                const positions = positionsResponse.data.rows;

                
                return {
                    id: order.id,
                    name: order.name,
                    description: order.description || null,
                    moment: order.moment,
                    sum: order.sum / 100,
                    vatSum: order.vatSum / 100, 
                    payedSum: order.payedSum / 100, 
                    shippedSum: order.shippedSum / 100, 
                    invoicedSum: order.invoicedSum / 100, 
                    reservedSum: order.reservedSum / 100, 
                    created: order.created,
                    updated: order.updated,
                    printed: order.printed,
                    published: order.published,
                    agent: order.agent?.meta?.href || null,
                    organization: order.organization?.meta?.href || null,
                    positions: positions.map((position: any) => ({
                        product: position.assortment.meta.href,
                        quantity: position.quantity,
                        price: position.price / 100, 
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
