import express from 'express';
import * as orders from '../controllers/orderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/:userId', authMiddleware, orders.getUserOrders)
    .get('/all', validateJWT, orders.getAllOrders)
    .post('/create', authMiddleware, orders.createOrder)


export default router;
