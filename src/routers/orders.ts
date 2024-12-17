import express from 'express';
import * as orders from '../controllers/orderController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router
    // .get('/all', orders.getAllOrders) // Fetch all orders with optional filters
    .get('/list', 
    // authMiddleware,
     orders.getUserOrders) // Fetch orders for a specific user
    .post('/create', authMiddleware, orders.createOrder); // Create a new order

export default router;
