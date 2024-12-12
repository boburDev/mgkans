import { Request, Response } from 'express';
import ProductModel, { ProductPictureModel, ProductTagModel } from '../models/products';
import Category from '../models/category';
import encodeCredentials from '../utils/getAccessToken'
import SubCategory from '../models/sub-category';
import mongoose from 'mongoose';
import { verify } from '../utils/jwt';
import fs from "fs";
import path from "path";
import axios from 'axios';

export const getProducts = async (req: Request, res: Response) => {
    try {
        // Step 1: Get the access token using `encodeCredentials`
        const accessToken = encodeCredentials(process.env.LOGIN,process.env.PASSWORD);

        // Step 2: Fetch products from the Moysklad API
        const response:any = await axios.get(
            'https://api.moysklad.ru/api/remap/1.2/entity/product',
            {
                headers: {
                    Authorization: `Basic ${accessToken}`,
                },
            }
        );

        

        // Step 4: Respond with the formatted product data
        res.status(200).json({ data: response.data });
    } catch (error:any) {
        // Handle and log errors
        res.status(500).json({
            message: 'Failed to fetch products',
            error: error.response?.data || error.message,
        });
    }
};

export const findSimilarProducts = async (req: Request, res: Response) => {
    try {
        const { hashtag } = req.body;

        if (!hashtag || !Array.isArray(hashtag) || hashtag.length === 0) {
            res.status(200).json({ products: [] });
            return
        }

        const products = await ProductModel.find({
            hashtag: { $in: hashtag },
        }).select("name definition price path hashtag");

        res.status(200).json({ products });
    } catch (error) {
        console.error("Error finding similar products:", error);
        res.status(500).json({ message: "Failed to retrieve similar products.", error });
    }
};

export const getProductsBySubCategory = async (req: Request, res: Response) => {
    try {
        const { subCategoryId } = req.params;
        const subCategory = await SubCategory.find({ _id: subCategoryId });
        if (!subCategory) throw new Error("subCategory not found");

        const token = req.headers.authorization?.split(' ')[1];
        let decoded: any | null = verify(String(token));

        let isAdmin: any = decoded ? (decoded.isLegal && decoded?.userLegal?.status == 2) : false

        if (subCategory.length) {

            const subCategoryArray = subCategory.map((id) => new mongoose.Types.ObjectId(id.id))

            const products = await ProductModel.aggregate([
                {
                    $match: {
                        subCategoryId: { $in: subCategoryArray },
                    },
                },
                {
                    $lookup: {
                        from: "subcategories",
                        localField: "subCategoryId",
                        foreignField: "_id",
                        as: "subCategory",
                    },
                },
                {
                    $unwind: "$subCategory",
                },
                {
                    $addFields: {
                        sortIndex: {
                            $indexOfArray: [subCategoryArray, "$subCategoryId"],
                        },
                    },
                },
                {
                    $sort: {
                        sortIndex: 1,
                    },
                },
                {
                    $group: {
                        _id: "$subCategory.name",
                        products: {
                            $push: {
                                path: "$path",
                                name: "$name",
                                definition: "$definition",
                                subCategoryId: "$subCategoryId",
                                productId: "$_id",
                                ...(isAdmin && { price: "$price" }),
                            },
                        },
                    },
                },
            ]);

            res.status(201).json({ products: products[0]?.products });
        } else {
            res.status(201).json({ products: [], message: "subcategory not found" });
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const getSingleProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Step 1: Get the access token using `encodeCredentials`
        const accessToken = encodeCredentials(process.env.LOGIN, process.env.PASSWORD);

        // Step 2: Fetch the product details from Moysklad API
        const productResponse = await axios.get(
            `https://api.moysklad.ru/api/remap/1.2/entity/product/${id}`,
            {
                headers: {
                    Authorization: `Basic ${accessToken}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        const product:any = productResponse.data;

        // Step 4: Format the response
        

        // Step 5: Send the response
        res.status(200).json({data: product});
    } catch (error:any) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            message: "Error fetching product",
            error: error.response?.data || error.message,
        });
    }
};

export const searchProductsByName = async (req: Request, res: Response) => {
    try {
        const { name } = req.query;
        
        if (!name || typeof name !== "string") {
            res.status(400).json({ error: "Please provide a valid product name to search." });
            return;
        }

        // Step 1: Get the access token using `encodeCredentials`
        const accessToken = encodeCredentials(process.env.LOGIN, process.env.PASSWORD);

        // Step 2: Perform search in the Moysklad API
        const productsResponse:any = await axios.get(
            `https://api.moysklad.ru/api/remap/1.2/entity/product`,
            {
                params: {
                    search: name, // Use the `search` query parameter to search by name
                },
                headers: {
                    Authorization: `Basic ${accessToken}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        const products = productsResponse.data.rows;

        // Step 3: If no products are found
        if (!products.length) {
            res.status(404).json({ message: "No products found with the given name." });
            return;
        }
        
        // Step 5: Send the response
        res.status(200).json({
            message: "Products retrieved successfully",
            data: products,
        });
    } catch (error:any) {
        console.error("Error searching products by name:", error);
        res.status(500).json({ message: "Error searching products by name", error: error.response?.data || error.message });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || !files.length) {
            res.status(400).json({ error: "No files were uploaded." });
            return
        }

        const newProduct = new ProductModel({
            name: req.body.name,
            definition: req.body.definition,
            path: files[0].destination.split('./public')[1] + '/' + files[0].filename,
            price: req.body.price,
            rate: req.body.rate,
            sale: req.body.sale || 0,
            hashtag: req.body.hashtag || [],
            subCategoryId: req.body.subCategoryId,
        });

        const product = await newProduct.save();

        for (const file of files) {
            const newPicture = new ProductPictureModel({
                productId: product._id,
                path: `${file.destination.split('./public')[1]}/${file.filename}`,
            });
            await newPicture.save();
        }

        res.status(200).json({
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: 'Error creating category', error });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.body;

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            {
                name: req.body.name || product.name,
                definition: req.body.definition || product.definition,
                price: req.body.price || product.price,
                rate: req.body.rate || product.rate,
                sale: req.body.sale || product.sale,
                hashtag: req.body.hashtag || product.hashtag,
                subCategoryId: req.body.subCategoryId || product.subCategoryId
            },
            { new: true }
        );

        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Error updating product", error });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        const product = await ProductModel.findById(id);
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return
        }

        const pictures = await ProductPictureModel.find({ id });

        pictures.forEach((picture) => {
            const filePath = path.join(__dirname, "../../public", picture.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await ProductPictureModel.deleteMany({ id });
        await ProductModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Product and associated images deleted successfully." });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Failed to delete product.", error });
    }
};

export const createTag = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        const newTag = new ProductTagModel({ name });
        await newTag.save();

        res.status(201).json({ message: 'Tag created successfully', tag: newTag });
    } catch (error) {
        res.status(400).json({ error: error });
    }
}

export const getTags = async (req: Request, res: Response) => {
    try {
        const tags = await ProductTagModel.find();
        res.status(200).json(tags);
    } catch (error) {
        res.status(400).json({ error: error });
    }
}

export const deleteTag = async (req: Request, res: Response) => {
    try {
        const deletedTag = await ProductTagModel.findByIdAndDelete(req.params.id);
        if (!deletedTag) {
            res.status(404).json({ message: 'Tag not found' });
            return
        }
        res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error });
    }
}