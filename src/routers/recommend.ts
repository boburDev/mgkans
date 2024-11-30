import express from 'express';
import * as recommend from '../controllers/recommendController';
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/all', validateJWT, recommend.getAllRecommendations)
    .get('/category/:categoryId', recommend.getRecommendationsByCategory)
    .post('/create', validateJWT, recommend.createRecommendation)
    .post('/delete', validateJWT, recommend.deleteRecommendation)


export default router;