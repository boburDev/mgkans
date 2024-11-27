import express from 'express';
import * as advertise from '../controllers/advertise';
import { uploadPhoto } from '../middlewares/multer'

const router = express.Router();

router
    .get('/all', advertise.getAds)
    .post('/create', uploadPhoto.single('ads'), advertise.createAd)

export default router;