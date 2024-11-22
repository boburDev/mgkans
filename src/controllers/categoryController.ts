import { Request, Response } from 'express';
import Category from '../models/category';
import SubCategory from '../models/sub-category';

export const getAllCategory = async (req: Request, res: Response) => {
    try {
        const catalog = await Category.find().select("title path route colour order").sort({ order: 1 });
        res.status(201).json({ catalog });
    } catch (error) {
        res.status(500).json({ message: 'Error get category', error });
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
        res.status(500).json({ message: 'Error creating category', error });
    }
};

export const getAllSubCategory = async (req: Request, res: Response) => {
    try {
        const subCategory = await SubCategory.find().select("name order");
        res.status(201).json({ categories: subCategory });
    } catch (error) {
        res.status(500).json({ message: 'Error get subcategory', error });
    }
};

export const createSubCategory = async (req: Request, res: Response) => {
    try {
        console.log(req.body)
        
        const data = {
            name: req.body.name,
            categoryId: req.body.categoryId
        }

        const newCategory = new SubCategory(data);
        await newCategory.save();

        res.json({ data: newCategory, error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error creating subcategory', error });
    }
};

