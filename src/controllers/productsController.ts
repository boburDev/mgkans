import { Request, Response } from 'express';
import ProductModel, { ProductPictureModel, ProductTagModel } from '../models/products';
import Category from '../models/category';
import { accessToken } from '../utils/getAccessToken'
import fs from "fs";
import path from "path";
import axios from 'axios';
import { fetchMetaDetails } from '../utils/fetchMetaDetails';
import { checkToken } from '../middlewares/authMiddleware';

export const getAllProducts = async (req: Request, res: Response): Promise<any> => {
    try {
        let { category } = req.query;

        if (!category) {
            res.status(400).json({ message: 'Category is required' });
            return;
        }

        const categoryData = await Category.findOne({ _id: category });

        if (!categoryData) throw new Error("Category not found");
        category = categoryData.title;
        const token = await accessToken();

        if (!token) {
            res.status(500).json({ message: 'Failed to fetch access token' });
            return;
        }

        const response: any = await axios.get(
            `https://api.moysklad.ru/api/remap/1.2/entity/product`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        const products = response.data?.rows || [];
        const groupedProducts: { [key: string]: any[] } = {}; // Adjusted to store arrays of products directly

        const tokenUser = req.headers?.authorization?.split(' ')[1];
        const decoded: any = await checkToken(String(tokenUser));
        let isAdmin: any = (typeof decoded != 'string') ? (decoded?.isLegal && decoded?.userLegal?.status == 2) : false;

        for (const product of products) {
            const pathName = product.pathName || '';
            const [mainCategory, subCategory] = pathName.split('/');

            // Only include products matching the `category`
            if (mainCategory === category) {
                const subCategoryName = subCategory || 'Uncategorized';
                const subCategoryId = product.productFolder.meta.href.split("productfolder/")[1];

                // Create the key in the format "subcategoryName:id"
                const subCategoryKey = `${subCategoryName}:${subCategoryId}`;

                // Initialize array for subcategory if it doesn't exist
                if (!groupedProducts[subCategoryKey]) {
                    groupedProducts[subCategoryKey] = [];
                }

                // Fetch images metadata for the product if it has images
                let images = [];
                if (product.images?.meta?.href) {
                    const imageDetails = await fetchMetaDetails(product.images.meta.href, token);
                    if (imageDetails) {
                        images = imageDetails.map((image: any) => ({
                            title: image.title,
                            filename: image.filename,
                            href: image.miniature.downloadHref,
                        }));
                    }
                }

                // Add the product with image details to the relevant subcategory group
                groupedProducts[subCategoryKey].push({
                    id: product.id,
                    name: product.name,
                    description: product.description || '',
                    archived: product.archived || false,
                    images: images || null,
                    ...(isAdmin && { buyPrice: product.buyPrice?.value || null }),
                });
            }
        }

        // Respond with grouped products
        res.status(200).json(groupedProducts);
    } catch (error: any) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            message: 'Failed to fetch products by category',
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

export const getProductsBySubcategory = async (req: Request, res: Response) => {
    try {
        const { subcategoryId } = req.params;

        if (!subcategoryId || typeof subcategoryId !== 'string') {
            res.status(400).json({ message: 'Subcategory ID is required' });
            return;
        }

        // Fetch the access token
        const token = await accessToken();
        if (!token) {
            res.status(500).json({ message: 'Failed to fetch access token' });
            return;
        }

        // Fetch all products
        const response: any = await axios.get(
            'https://api.moysklad.ru/api/remap/1.2/entity/product',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        const products = response.data?.rows || [];
        const groupedProducts: { [key: string]: any[] } = {};

        // Check admin status
        const tokenUser = req.headers?.authorization?.split(' ')[1];
        const decoded: any = await checkToken(String(tokenUser));
        const isAdmin: any =
            typeof decoded !== 'string'
                ? decoded?.isLegal && decoded?.userLegal?.status == 2
                : false;

        for (const product of products) {
            const pathName = product.pathName || '';
            const [mainCategory, subCategory] = pathName.split('/');

            // Only include products matching the `subcategoryId`
            if (
                product.productFolder?.meta?.href &&
                product.productFolder.meta.href.includes(subcategoryId)
            ) {
                const subCategoryKey = subCategory || 'Uncategorized';

                // Initialize array for subcategory if it doesn't exist
                if (!groupedProducts[subCategoryKey]) {
                    groupedProducts[subCategoryKey] = [];
                }

                // Fetch images metadata for the product if it has images
                let images = [];
                if (product.images?.meta?.href) {
                    const imageDetails = await fetchMetaDetails(product.images.meta.href, token);
                    if (imageDetails) {
                        images = imageDetails.map((image: any) => ({
                            title: image.title,
                            filename: image.filename,
                            href: image.miniature.downloadHref,
                        }));
                    }
                }

                // Add the product with image details to the relevant subcategory group
                groupedProducts[subCategoryKey].push({
                    id: product.id,
                    name: product.name,
                    description: product.description || '',
                    archived: product.archived || false,
                    images: images || null,
                    ...(isAdmin && { buyPrice: product.buyPrice?.value || null }),
                });
            }
        }

        // Respond with grouped products
        res.status(200).json(groupedProducts);
    } catch (error: any) {
        console.error('Error fetching products by subcategory:', error.message);
        res.status(500).json({
            message: 'Failed to fetch products by subcategory',
            error: error.response?.data || error.message,
        });
    }
};



// export const getProductsBySubCategory = async (req: Request, res: Response) => {
//     try {
//         const { subCategoryId } = req.params;
//         const subCategory = await SubCategory.find({ _id: subCategoryId });
//         if (!subCategory) throw new Error("subCategory not found");

// const token = req.headers.authorization?.split(' ')[1];
// let decoded: any | null = verify(String(token));

// let isAdmin: any = decoded ? (decoded.isLegal && decoded?.userLegal?.status == 2) : false

//         if (subCategory.length) {

//             const subCategoryArray = subCategory.map((id) => new mongoose.Types.ObjectId(id.id))

//             const products = await ProductModel.aggregate([
//                 {
//                     $match: {
//                         subCategoryId: { $in: subCategoryArray },
//                     },
//                 },
//                 {
//                     $lookup: {
//                         from: "subcategories",
//                         localField: "subCategoryId",
//                         foreignField: "_id",
//                         as: "subCategory",
//                     },
//                 },
//                 {
//                     $unwind: "$subCategory",
//                 },
//                 {
//                     $addFields: {
//                         sortIndex: {
//                             $indexOfArray: [subCategoryArray, "$subCategoryId"],
//                         },
//                     },
//                 },
//                 {
//                     $sort: {
//                         sortIndex: 1,
//                     },
//                 },
//                 {
//                     $group: {
//                         _id: "$subCategory.name",
//                         products: {
//                             $push: {
//                                 path: "$path",
//                                 name: "$name",
//                                 definition: "$definition",
//                                 subCategoryId: "$subCategoryId",
//                                 productId: "$_id",
//                                 ...(isAdmin && { price: "$price" }),
//                             },
//                         },
//                     },
//                 },
//             ]);

//             res.status(201).json({ products: products[0]?.products });
//         } else {
//             res.status(201).json({ products: [], message: "subcategory not found" });
//         }
//     } catch (error) {
//         console.error("Error fetching products:", error);
//         res.status(500).json({ message: "Internal server error", error });
//     }
// }

export const getSingleProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Fetch the access token
        const token = await accessToken();
        if (!token) {
            res.status(500).json({ message: 'Failed to fetch access token' });
            return;
        }

        // Fetch product details
        const productResponse = await axios.get(
            `https://api.moysklad.ru/api/remap/1.2/entity/product/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        const product: any = productResponse.data;

        // Check admin status
        const tokenUser = req.headers?.authorization?.split(' ')[1];
        const decoded: any = await checkToken(String(tokenUser));
        const isAdmin: any =
            typeof decoded !== 'string'
                ? decoded?.isLegal && decoded?.userLegal?.status == 2
                : false;

        // Extract mainCategory and subCategory from pathName
        const pathName = product.pathName || '';
        const [mainCategory, subCategory] = pathName.split('/');

        // Fetch images metadata for the product if it has images
        let images = [];
        if (product.images?.meta?.href) {
            const imageDetails = await fetchMetaDetails(product.images.meta.href, token);
            if (imageDetails) {
                images = imageDetails.map((image: any) => ({
                    title: image.title,
                    filename: image.filename,
                    // href: image.downloadHref,
		    href: image.miniature.downloadHref,
                }));
            }
        }

        // Format the product response
        const formattedProduct = {
            id: product.id,
            name: product.name,
            description: product.description || '',
            code: product.code || '',
            price: product.salePrices?.[0]?.value || 0,
            archived: product.archived || false,
            pathName: product.pathName || '',
            subcategoryId: product.productFolder.meta.href.split("productfolder/")[1],
            mainCategory: mainCategory || '',
            images: images || null,
            ...(isAdmin && { buyPrice: product.buyPrice?.value || null }),
        };

        // Send the formatted product response
        res.status(200).json({ data: formattedProduct });
    } catch (error: any) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            message: 'Error fetching product',
            error: error.response?.data || error.message,
        });
    }
};




export const searchProductsByName = async (req: Request, res: Response) => {
    try {
        const { name } = req.query;
        const token = await accessToken();

        if (!name || typeof name !== "string") {
            res.status(400).json({ error: "Please provide a valid product name to search." });
            return;
        }

        const productsResponse: any = await axios.get(
            `https://api.moysklad.ru/api/remap/1.2/entity/product`,
            {
                params: {
                    search: name, // Use the `search` query parameter to search by name
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        const products = productsResponse.data.rows;

        // If no products are found
        if (!products.length) {
            res.status(404).json({ message: "No products found with the given name." });
            return;
        }

        // Format the product response to only include relevant fields
        const formattedProducts = products.map((product: any) => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            code: product.code || '',
            price: product.salePrices?.[0]?.value || 0,
            archived: product.archived || false,
            productFolder: product.productFolder?.meta?.href || '',
        }));

        // Send the formatted products response
        res.status(200).json({
            message: "Products retrieved successfully",
            data: formattedProducts,
        });
    } catch (error: any) {
        console.error("Error searching products by name:", error);
        res.status(500).json({
            message: "Error searching products by name",
            error: error.response?.data || error.message,
        });
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
