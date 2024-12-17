import express from 'express';
import * as contract from '../controllers/contractController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router
    // .get('/all', contract.getAllContracts)
    .get('/balance', authMiddleware, contract.getContractSingle)

export default router;