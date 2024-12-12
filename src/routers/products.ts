import express from 'express';
import * as products from '../controllers/productsController';
import { uploadPhoto } from '../middlewares/multer';
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/all', products.getAllProducts)
    .get('/by-category/:pathName', products.getProductsByCategory)
    .get('/single/:id', products.getSingleProduct)
    .get('/search', products.searchProductsByName)
    .get('/similar-products', products.findSimilarProducts)
    .get('/by-subcategory/:subcategoryId', products.getProductsBySubcategory)
    .post('/create', validateJWT, uploadPhoto.array('photos', 5), products.createProduct)
    .post('/delete', validateJWT, products.deleteProduct)
    .get('/tags', validateJWT, products.getTags)
    .post('/create-tag', validateJWT, products.createTag)
    .post('/delete-tag/:id', validateJWT, products.deleteTag)


export default router;
