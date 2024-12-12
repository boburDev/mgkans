import express from 'express';
import * as contract from '../controllers/contractController';
import { validateJWT } from '../middlewares/validateAdmin';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router
    .get('/all', validateJWT, contract.getAllContracts)

export default router;