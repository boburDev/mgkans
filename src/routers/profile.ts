import express from 'express';
import * as profile from '../controllers/profileController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router
    .get('/', authMiddleware, profile.getCurrentUser)


export default router;