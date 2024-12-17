import express from 'express';
import * as counteragent from '../controllers/counteragentController';

const router = express.Router();

router
    .get('/all', counteragent.getAllCounteragents)
    .get('/single/:id', counteragent.getSingleCounteragent)

export default router;