import express from 'express';
import * as users from '../controllers/usersController';
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/physical', validateJWT, users.getPhysicalUsers)
    // .get('/legal/by-id/:userId', validateJWT, users.getLegalsUser)
    .get('/legal/:status', validateJWT, users.getLegalsUsers)
    .post('/legal/update', validateJWT, users.updateLegalUserStatus)

export default router;