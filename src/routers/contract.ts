import express from 'express';
import * as contract from '../controllers/contractController';

const router = express.Router();

router
    .get('/all', contract.getAllContracts)

export default router;