import express from 'express';
import * as advertise from '../controllers/advertiseController';
import { uploadPhoto } from '../middlewares/multer'

const router = express.Router();

router
    .get('/all', advertise.getAds)
    .post('/create', uploadPhoto.single('ads'), advertise.createAd)
    .post('/delete/:id', advertise.deleteAdvertising)

export default router;