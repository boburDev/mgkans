import { Request, Response } from 'express';
import axios from 'axios';
import { accessToken } from '../utils/getAccessToken';

export const getAllContracts = async (req: Request, res: Response) => {
    try {
        const token = await accessToken();
        if (!token) {
            res.status(500).json({ message: 'Failed to fetch access token' });
            return;
        }

        // Fetch product folders using the access token
        const contractResponse: any = await axios.get(
            'https://api.moysklad.ru/api/remap/1.2/entity/contract',
            {
                headers: {
                    Authorization: `Basic ${token}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

       

        res.status(200).json({ data: contractResponse.data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contract', error });
    }
}