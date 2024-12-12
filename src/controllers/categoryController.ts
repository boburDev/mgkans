import fs from 'fs';
import path from 'path'; 
import { Request, RequestHandler, Response } from 'express';
import Category from '../models/category';
import SubCategory from '../models/sub-category';
import axios from 'axios';
import encodeCredentials from '../utils/getAccessToken'

export const getAllCategory = async (req: Request, res: Response) => {
    try {
        // Fetch the access token
        const login: string = 'admin@shakhtj';
        const password: string = '311207';
        const tokenResponse: any = await axios.post(
            'https://api.moysklad.ru/api/remap/1.2/security/token',
            null,
            {
                headers: {
                    Authorization: `Basic ${encodeCredentials(login, password)}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        const accessToken: string = tokenResponse.data.access_token;

        // Fetch product folders using the access token
        const productFolderResponse:any = await axios.get(
            'https://api.moysklad.ru/api/remap/1.2/entity/productfolder',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        res.status(200).json({ data: productFolderResponse.data });
    } catch (error: any) {
        console.error('Error fetching product folders:', error.message);
        if (error.response) {
            res.status(error.response.status).json({
                message: error.response.data || 'Error fetching product folders',
            });
        } else {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        if (!req.file) throw new Error('File is failed')
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

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const category = await Category.findById(id);
        if (!category) {
            res.status(404).json({ message: 'Category not found', error: true });
            return
        }

        const updateData: Record<string, any> = {};
        if (req.body.title !== undefined) updateData.title = req.body.title;
        if (req.body.route !== undefined) updateData.route = req.body.route;
        if (req.body.colour !== undefined) updateData.colour = req.body.colour;

        let oldFilePath: string | undefined;

        if (req.file) {
            const newPath = req.file.destination.split('./public')[1] + '/' + req.file.filename;
            oldFilePath = category.path;
            updateData.path = newPath;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            res.status(500).json({ message: 'Error updating category', error: true });
            return
        }

        if (oldFilePath) {
            const absolutePath = path.join(__dirname, '../public', oldFilePath);
            fs.unlink(absolutePath, (err) => {
                if (err) {
                    console.error('Error removing old file:', err);
                }
            });
        }

        res.json({ data: updatedCategory, error: false, message: 'Category updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        
        const category = await Category.findById(id);
        if (!category) {
            res.status(404).json({ message: 'Category not found', error: true });
            return
        }
        
        if (category.path) {
            const absolutePath = path.join(__dirname, '../../public', category.path);
            fs.unlink(absolutePath, (err) => {
                if (err) {
                    console.error('Error removing file:', err);
                }
            });
        }

        await Category.findByIdAndDelete(id);

        res.json({ message: 'Category deleted successfully', error: false });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
};

export const getAllSubCategory = async (req: Request, res: Response) => {
    try {
        const subCategory = await SubCategory.find({ categoryId: req.query.id }).select("name order categoryId");
        res.status(201).json({ categories: subCategory });
    } catch (error) {
        res.status(500).json({ message: 'Error get subcategory', error });
    }
};

export const createSubCategory = async (req: Request, res: Response) => {
    try {
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

export const updateSubCategory = async (req: Request, res: Response) => {
    try {
        const { id, name, categoryId } = req.body;

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            id,
            { name, categoryId },
            { new: true, runValidators: true }
        );

        if (!updatedSubCategory) {
            res.status(404).json({ message: 'Subcategory not found', error: true });
            return
        }

        res.json({ data: updatedSubCategory, error: false, message: 'Subcategory updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating subcategory', error });
    }
};

export const deleteSubCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        console.log(req.body);
        
        const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

        if (!deletedSubCategory) {
            res.status(404).json({ message: 'Subcategory not found', error: true });
            return
        }

        res.json({ data: deletedSubCategory, error: false, message: 'Subcategory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subcategory', error });
    }
};

export const getProductGroupById: any = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Product group ID is required' });
        }

        const login = 'admin@shakhtj';
        const password = '311207';
        const tokenResponse: any = await axios.post(
            'https://api.moysklad.ru/api/remap/1.2/security/token',
            null,
            {
                headers: {
                    Authorization: `Basic ${encodeCredentials(login, password)}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        const productGroupResponse: any = await axios.get(
            `https://api.moysklad.ru/api/remap/1.2/entity/productfolder/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        res.status(200).json({ data: productGroupResponse.data });
    } catch (error: any) {
        console.error('Error fetching product group by ID:', error.message);
        if (error.response) {
            res.status(error.response.status).json({
                message: error.response.data || 'Error fetching product group by ID',
            });
        } else {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
};
