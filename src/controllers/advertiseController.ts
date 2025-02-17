import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import AdvertisingModel from '../models/advertise';
import Category from '../models/category';

export const getAdsByCategory = async (req: Request, res: Response) => {
    try {
        let catalog = req.params.name
        let ads
        if (typeof catalog == 'string' && catalog.length == 24) {
            ads = await AdvertisingModel.find({ categoryId: catalog }).populate('categoryId', 'name').select("categoryId path url");
        } else {
            ads = await AdvertisingModel.find({ categoryId: null }).populate('categoryId', 'name').select("categoryId path url");
        }
        
        res.status(201).json({ data: ads });
    } catch (error) {
        res.status(500).json({ message: 'Error getting Advertise', error });
    }
}


export const getAds = async (req: Request, res: Response) => {
    try {
        const ads = await AdvertisingModel.find().populate('categoryId', 'name');
        res.status(201).json({ data: ads });
    } catch (error) {
        res.status(500).json({ message: 'Error getting Advertise', error });
    }
}

export const createAd = async (req: Request, res: Response) => {
    try {
        if (!req.file) throw new Error('File is failed')
        let file = req.file
        const newPath = file.destination.split('./public')[1] + '/' + file.filename
        const data = {
            url: req.body.url,
            categoryId: req.body.categoryId || null,
            path: newPath
        }

        const ads = new AdvertisingModel(data);
        await ads.save();
        res.status(201).json({ data: ads, error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error getting Advertise', error });
    }
}

export const deleteAdvertising = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ad = await AdvertisingModel.findById(id);
        if (!ad) {
            res.status(404).json({ message: 'Advertisement not found' });
            return
        }

        const filePath = path.join(__dirname, '../../public', ad.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await AdvertisingModel.findByIdAndDelete(id);

        res.status(200).json({ message: 'Advertisement and file deleted successfully' });
    } catch (error) {
        console.error('Error deleting advertisement:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};