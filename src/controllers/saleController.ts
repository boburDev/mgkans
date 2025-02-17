import fs from 'fs';
import path from 'path'; 
import { Request, Response } from 'express';
import SaleModel from '../models/sale';

export const getSale = async (req: Request, res: Response) => {
    try {
        const ads = await SaleModel.find().select("path url").sort({ order: 1 });
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

export const deleteSale = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ad = await SaleModel.findById(id);
        if (!ad) {
            res.status(404).json({ message: 'Sale not found' });
            return
        }

        const filePath = path.join(__dirname, '../../public', ad.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await SaleModel.findByIdAndDelete(id);

        res.status(200).json({ message: 'Sale and file deleted successfully' });
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};