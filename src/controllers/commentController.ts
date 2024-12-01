import { Request, Response } from 'express';
import { ProductCommentModel } from '../models/products';

export const createProductComment = async (req: Request, res: Response) => {
    try {
        const { productId, comment } = req.body;

        if (!productId || !comment) {
            res.status(400).json({ message: "Product ID and comment are required." });
            return
        }
        const isLegal = req.user.isLegal;
        const userName = isLegal
            ? req.user.userLegal?.name
            : req.user.userPhysical?.name;

        if (!userName) {
            res.status(400).json({ message: "User name is required." });
            return
        }

        const newComment = new ProductCommentModel({
            productId,
            userName,
            legalId: isLegal ? req.user.userLegal?._id : null,
            physicalId: isLegal ? null : req.user.userPhysical?._id,
            comment,
        });


        const savedComment = await newComment.save();

        res.status(201).json({
            message: "Comment added successfully.",
            comment: savedComment,
        });
    } catch (error) {
        console.error("Error creating product comment:", error);
        res.status(500).json({ message: "Failed to add comment.", error });
    }
};

export const getAllComments = async (req: Request, res: Response) => {
    try {
        const comments = await ProductCommentModel.find();

        res.status(200).json({ comments });
    } catch (error) {
        console.error("Error retrieving comments:", error);
        res.status(500).json({
            message: "Failed to retrieve comments.",
            error,
        });
    }
};

export const getAllCommentsByUser = async (req: Request, res: Response) => {
    try {

        const isLegal = req.user.isLegal;
        const userId = isLegal
            ? req.user.userLegal?._id
            : req.user.userPhysical?._id;

        let comments

        if (isLegal) {
            comments = await ProductCommentModel.find({ legalId: userId }).sort({ date: -1 });
            console.log(comments)
        } else {
            comments = await ProductCommentModel.find({ physicalId: userId }).sort({ date: -1 });
            console.log(comments)
        }

        if (!comments.length) {
            res.status(200).json({ comments: [] });
            return
        }

        res.status(200).json({ comments });
    } catch (error) {
        console.error("Error retrieving comments:", error);
        res.status(500).json({
            message: "Failed to retrieve comments.",
            error,
        });
    }
};

export const getCommentsByProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            res.status(400).json({ message: "Product ID is required." });
            return
        }

        const comments = await ProductCommentModel.find({ productId }).sort({ date: -1 });

        if (!comments.length) {
            res.status(200).json({ comments: [] });
            return
        }

        res.status(200).json({ comments });
    } catch (error) {
        console.error("Error retrieving product comments:", error);
        res.status(500).json({ message: "Failed to retrieve comments.", error });
    }
};

export const deleteProductComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.body;

        if (!commentId) {
            res.status(400).json({ message: "Comment ID is required." });
            return
        }

        const deletedComment = await ProductCommentModel.findByIdAndDelete(commentId);

        if (!deletedComment) {
            res.status(404).json({ message: "Comment not found." });
            return
        }

        res.status(200).json({ comment: deletedComment });
    } catch (error) {
        console.error("Error deleting product comment:", error);
        res.status(500).json({ message: "Failed to delete comment.", error });
    }
};
