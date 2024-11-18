import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const getAllCategory = async (req: Request, res: Response) => {
    try {
        const catalog = [
            { title: '', route: '/deli', path: '/category/deli.png' },
            { title: 'ЭКСМО - Ежедневники', route: '/eksmo', path: '/category/eksmo.png' },
            { title: 'M&G - Ручки шариковые', route: '/mg', path: '/category/M&G.png' },
            { title: 'Мульти пульти - Папки', route: '/multipulti', path: '/category/multipulti.png' }
        ]
        
        res.status(201).json({ catalog });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        if (!req.file) throw new Error('File is failed')
        const filePath = req.file.path;
        let file = req.file
        const newPath = file.destination.split('./public')[1] + '/' + file.filename
        res.json({ data: newPath, error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

export const downloadPhotos = async (req: Request, res: Response) => {
    try {
        const pathFile = String(req.headers.path)
        const imagePath = path.join(__dirname, '../../../public', pathFile);
        fs.readFile(imagePath, (err, data) => {
            if (err) {
                return res.status(500).send('Error reading the image path.');
            }
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(data);
        });
    } catch (error) {
        res.status(500).json({ data: null, error: (error as Error).message })
    }
}