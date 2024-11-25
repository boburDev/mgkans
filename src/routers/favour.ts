import express from 'express';
import * as favour from '../controllers/favourController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router
    .get('/:userId', authMiddleware, favour.getFavorites)
    .post('/add', authMiddleware, favour.addFavorite)
    .post('/remove', authMiddleware, favour.removeFavorite)


export default router;
