import express from 'express';
import * as bonusSystem from '../controllers/bonusSystemController';
import { uploadPhoto } from '../middlewares/multer'
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/all', validateJWT, bonusSystem.getAllBonusSystems)
    .get('/bonus', authMiddleware, bonusSystem.getBonusSystemByToken)
    .post('/create', authMiddleware, uploadPhoto.single('bonus'), bonusSystem.createBonusSystem)
    .post('/delete/:id', validateJWT, bonusSystem.deleteBonusSystem)

export default router;