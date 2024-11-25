import express from 'express';
import * as orders from '../controllers/orderController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router
    .get('/:userId', authMiddleware, orders.getUserOrders)
    .get('/all', orders.getAllOrders)
    .post('/create', authMiddleware, orders.createOrder)


export default router;
