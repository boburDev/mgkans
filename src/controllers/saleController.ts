import { Request, Response } from 'express';
import SaleModel from '../models/sale';

export const getSale = async (req: Request, res: Response) => {
    try {
        const ads = await SaleModel.find();
        res.status(201).json({ data: ads });
    } catch (error) {
        res.status(500).json({ message: 'Error getting sale', error });
    }
}

export const createSale = async (req: Request, res: Response) => {
    try {
        if (!req.file) throw new Error('File is failed')
        let file = req.file
        const newPath = file.destination.split('./public')[1] + '/' + file.filename
        const data = {
            url: req.body.url,
            path: newPath
        }

        const ads = new SaleModel(data);
        await ads.save();
        res.status(201).json({ data: ads, error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error getting sale', error });
    }
}