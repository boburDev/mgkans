import { Request, Response } from 'express';
import OrderModel from '../models/order';

export const createOrder = async (req: Request, res: Response) => {
    try {
        // { productId: string; quantity: number; price: number }
        const { userId, items } = req.body;
        const totalAmount = items.reduce((sum: any, item: any) => sum + item.quantity * item.price, 0);

        const order = new OrderModel({
            userId,
            items,
            totalAmount,
        });
        await order.save();

        res.json({ data: order, error: false, message: null })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error creating category', error });
    }
}

export const getUserOrders = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params

        const orders = await OrderModel.find({ userId })
            .populate("items.productId")
            .exec();

        res.json({ data: orders, error: false, message: null })
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
}

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, userId, status, sort = "createdAt", order = "desc" } = req.query;

        // Pagination settings
        const pageNumber = Math.max(1, parseInt(page as string, 10));
        const pageSize = Math.max(1, parseInt(limit as string, 10));

        // Build filter query
        const filter: any = {};
        if (userId) filter.userId = userId;
        if (status) filter.status = status;

        // Fetch total count for pagination
        const totalOrders = await OrderModel.countDocuments(filter);

        // Fetch orders with pagination and sorting
        const orders = await OrderModel.find(filter)
            .populate("userId", "name email")
            .populate("items.productId", "name price")
            .sort({ [sort as string]: order === "asc" ? 1 : -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        res.status(200).json({
            totalOrders,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalOrders / pageSize),
            pageSize,
            orders,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders", error });
    }
};
