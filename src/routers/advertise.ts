import express from 'express';
import * as advertise from '../controllers/advertise';

const router = express.Router();

router
    .get('/all', advertise.getAds)
    .post('/create', advertise.createAd)

export default router;