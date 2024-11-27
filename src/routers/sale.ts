import express from 'express';
import * as sale from '../controllers/saleController';
import { uploadPhoto } from '../middlewares/multer'

const router = express.Router();

router
    .get('/all', sale.getSale)
    .post('/create', uploadPhoto.single('sale'), sale.createSale)
    .post('/delete/:id', sale.deleteSale)

export default router;