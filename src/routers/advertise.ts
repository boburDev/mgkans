import express from 'express';
import * as advertise from '../controllers/advertiseController';
import { uploadPhoto } from '../middlewares/multer'
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/all', validateJWT, advertise.getAds)
    .get('/selected-ads/:name', advertise.getAdsByCategory)
    .post('/create', validateJWT, uploadPhoto.single('ads'), advertise.createAd)
    .post('/delete/:id', validateJWT, advertise.deleteAdvertising)

export default router;