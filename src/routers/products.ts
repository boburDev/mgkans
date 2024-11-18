import express from 'express';
import * as products from '../controllers/productsController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router
    .get('/:name/all', products.getProducts)


export default router;