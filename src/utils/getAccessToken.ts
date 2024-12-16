import axios from 'axios';
import { Request, Response } from 'express';

function encodeCredentials(login: string, password: string): string {
    return Buffer.from(`${login}:${password}`).toString('base64');
}

export const getAccessToken = async (req: Request, res: Response): Promise<void> => {
    const login: string = 'admin@shakhtj';
    const password: string = '311207';
    const apiUrl: string = 'https://api.moysklad.ru/api/remap/1.2/security/token';

    const encodedCredentials: string = encodeCredentials(login, password);

    try {
        const response: any = await axios.post(apiUrl, null, {
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
                'Accept-Encoding': 'gzip',
            },
        });

        res.status(200).json({ access_token: response?.data?.access_token });
    } catch (error: any) {
        console.error('Error fetching access token:', error.message);
        if (error.response) {
            res.status(error.response.status).json({
                message: error.response.data || 'Error fetching access token',
            });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};


console.log(encodeCredentials('admin@shakhtj','311207'))