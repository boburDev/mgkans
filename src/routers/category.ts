import express from 'express';
import * as category from '../controllers/categoryController';
import { uploadPhoto } from '../middlewares/multer'
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/all-in', category.getAllCategory)   
    .get('/all', category.getAllCategory1)
    .post('/create', validateJWT, uploadPhoto.single('photoFile'), category.createCategory)
    .post('/update', validateJWT, uploadPhoto.single('photoFile'), category.updateCategory)
    .post('/delete', validateJWT, category.deleteCategory)
    .get('/all-subcategory/:categoryId', category.getAllSubCategory)
    .post('/create-subcategory', validateJWT, category.createSubCategory)
    .post('/update-subcategory', validateJWT, category.updateSubCategory)
    .post('/delete-subcategory', validateJWT, category.deleteSubCategory)


export default router;
