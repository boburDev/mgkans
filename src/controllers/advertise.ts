import { Request, Response } from 'express';
import AdvertisingModel from '../models/advertise';

export const getAds = async (req: Request, res: Response) => {
    try {
        const ads = await AdvertisingModel.find().populate('categoryId', 'name');
        res.status(201).json({ data: ads });
    } catch (error) {
        res.status(500).json({ message: 'Error getting favourite', error });
    }
}

export const createAd = async (req: Request, res: Response) => {
    try {
        if (!req.file) throw new Error('File is failed')
        let file = req.file
        const newPath = file.destination.split('./public')[1] + '/' + file.filename
        const data = {
            url: req.body.url,
            categoryId: req.body.categoryId,
            path: newPath
        }

        const ads = new AdvertisingModel(data);
        await ads.save();
        res.status(201).json({ data: ads, error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error getting favourite', error });
    }
}