import express from 'express';
import * as legalUser from '../controllers/legalUserController';
import * as physicalUser from '../controllers/physicalUserController';

const router = express.Router();

router
    .post('/legal-register', legalUser.registerUser)
    .post('/physical-register', physicalUser.registerUser)

    .post('/legal-login', legalUser.loginUser)
    .post('/physical-login', physicalUser.loginUser)

    // .get('/legal-me', authMiddleware, legalUser.getCurrentUser)
    // .get('/physical-me', authMiddleware, physicalUser.getCurrentUser)


export default router;