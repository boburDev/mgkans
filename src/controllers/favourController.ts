import { Request, Response } from 'express';
import FavoriteProductModel from '../models/favour';

export const getFavorites = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params
        const favorites = await FavoriteProductModel.find({ userId })
            .populate("productId")
            .exec();

        res.json({ data: favorites, error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error getting favourite', error });
    }
}

export const addFavorite = async (req: Request, res: Response) => {
    try {
        const { userId, productId } = req.body
        const favorite = new FavoriteProductModel({ userId, productId });
        await favorite.save();
        res.json({ data: favorite, error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error creating favourite', error });
    }
}

export const removeFavorite = async (req: Request, res: Response) => {
    try {
        const { userId, productId } = req.body
        await FavoriteProductModel.deleteOne({ userId, productId });

        res.json({ data: 'Product removed from favorites.', error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error removing favourite', error });
    }
}