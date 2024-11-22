import express from 'express';
import * as category from '../controllers/categoryController';
import { uploadPhoto } from '../middlewares/multer'

const router = express.Router();

router
    .get('/all', category.getAllCategory)
    .get('/all-subcategory', category.getAllSubCategory)
    .post('/create', uploadPhoto.single('photoFile'), category.createCategory)
    .post('/create-subcategory', category.createSubCategory)


export default router;