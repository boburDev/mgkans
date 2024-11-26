import { Request, Response } from 'express';
import AdvertisingModel from '../models/advertise';

export const getFavorites = async (req: Request, res: Response) => {
    try {
       
    } catch (error) {
        res.status(500).json({ message: 'Error getting favourite', error });
    }
}
