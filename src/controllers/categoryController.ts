import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Category from '../models/category';

export const getAllCategory = async (req: Request, res: Response) => {
    try {
        const catalog = await Category.find().select("title path route colour order -_id").sort({ order: 1 });
        console.log("Documents found:", catalog);
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
        const data = {
            title: req.body.title || "",
            route: req.body.route,
            path: newPath,
            colour: req.body.colour
        }

        const newCategory = new Category(data);
        await newCategory.save();

        res.json({ data: newCategory, error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};
