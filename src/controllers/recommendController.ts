import { Request, Response } from 'express'
import RecommendModel from '../models/recommend';

export const getAllRecommendations = async (_req: Request, res: Response) => {
    try {
        const recommendations = await RecommendModel.find()
            .populate('productId', 'name price path')
            .populate('categoryId', 'name');

        res.status(200).json({
            message: 'Recommendations retrieved successfully.',
            recommendations,
        });
    } catch (error) {
        console.error('Error retrieving recommendations:', error);
        res.status(500).json({ message: 'Failed to retrieve recommendations.', error });
    }
};

export const getRecommendationsByCategory = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;

        if (!categoryId) {
            res.status(400).json({ message: 'Category ID is required.' });
            return
        }

        const recommendations = await RecommendModel.find({ categoryId })
            .populate('productId', 'name price path')
            .populate('categoryId', 'name');

        res.status(200).json({
            message: `Recommendations for category ${categoryId} retrieved successfully.`,
            recommendations,
        });
    } catch (error) {
        console.error('Error retrieving recommendations by category:', error);
        res.status(500).json({ message: 'Failed to retrieve recommendations by category.', error });
    }
};

export const createRecommendation = async (req: Request, res: Response) => {
    try {
        const data = {
            productId: req.body.productId,
            categoryId: req.body.categoryId
        }

        const newRecommend = new RecommendModel(data);
        await newRecommend.save();

        res.json({ data: newRecommend, error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error creating recommendation', error });
    }
};

export const deleteRecommendation = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        if (!id) {
            res.status(400).json({ message: 'Recommendation ID is required.' });
            return
        }

        const deletedRecommendation = await RecommendModel.findByIdAndDelete({ _id: id });

        if (!deletedRecommendation) {
            res.status(404).json({ message: 'Recommendation not found.' });
            return
        }

        res.status(200).json({
            message: 'Recommendation deleted successfully.',
            recommendation: deletedRecommendation,
        });
    } catch (error) {
        console.error('Error deleting recommendation:', error);
        res.status(500).json({ message: 'Failed to delete recommendation.', error });
    }
};