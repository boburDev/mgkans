import { NextFunction, Request, Response } from 'express';
import axios from 'axios';

const MOYSKLAD_BASE_URL = 'https://api.moysklad.ru/api/remap/1.2';
const MOYSKLAD_HEADERS = {
    'Authorization': `Basic ${Buffer.from(`${process.env.LOGIN}:${process.env.PASSWORD}`).toString('base64')}`,
    'Content-Type': 'application/json',
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    try {
        const response = await axios.get(`${MOYSKLAD_BASE_URL}/entity/counterparty`, {
            headers: MOYSKLAD_HEADERS,
            params: { filter: `email=${token}` },
        });

        const user = response.data as any;

        if (!user || !user.rows || user.rows.length === 0) {
            throw new Error('User not found!');
        }

        req.user = user.rows[0];
        next();
    } catch (err) {
        console.error('Error in authMiddleware:', err);
        res.status(400).json({ message: 'Token not verified!', error: true });
    }
};
