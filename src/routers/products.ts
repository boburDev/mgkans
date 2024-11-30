import express from 'express';
import * as products from '../controllers/productsController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadPhoto } from '../middlewares/multer';
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/:name/all', products.getProducts)
    .get('/signle/:id', products.getSingleProduct)
    .get('/similar-products', products.findSimilarProducts)
    .get('/by-id/:subCategoryId', products.getProductsBySubCategory)
    .post('/create', validateJWT, uploadPhoto.array('photos', 5), products.createProduct)
    .post('/delete', validateJWT, products.deleteProduct);


export default router;
