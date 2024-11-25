import express from 'express';
import * as products from '../controllers/productsController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadPhoto } from '../middlewares/multer';

const router = express.Router();

router
    .get('/:name/all', products.getProducts)
    .get('/signle/:id', products.getSingleProduct)
    .post('/create', uploadPhoto.array('photos', 5), products.createProduct)
    .delete("/delete", products.deleteProduct);


export default router;
