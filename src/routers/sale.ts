import express from 'express';
import * as sale from '../controllers/saleController';
import { uploadPhoto } from '../middlewares/multer'
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/all', sale.getSale)
    .post('/create', validateJWT, uploadPhoto.single('sale'), sale.createSale)
    .post('/delete/:id', validateJWT, sale.deleteSale)

export default router;