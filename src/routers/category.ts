import express from 'express';
import * as category from '../controllers/categoryController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadExcel } from '../middlewares/multer'

const router = express.Router();

router
    .get('/all', category.getAllCategory)
    .post('/create', uploadExcel.single('photoFile'), category.createCategory)


export default router;