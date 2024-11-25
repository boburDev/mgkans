import express from 'express';
import * as category from '../controllers/categoryController';
import { uploadPhoto } from '../middlewares/multer'

const router = express.Router();

router
    .get('/all', category.getAllCategory)
    .post('/create', uploadPhoto.single('photoFile'), category.createCategory)
    .post('/update', uploadPhoto.single('photoFile'), category.updateCategory)
    .post('/delete', category.deleteCategory)
    .get('/all-subcategory', category.getAllSubCategory)
    .post('/update-subcategory', category.updateSubCategory)
    .post('/delete-subcategory', category.deleteSubCategory)


export default router;