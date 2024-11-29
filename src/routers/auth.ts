import express from 'express';
import * as legalUser from '../controllers/legalUserController';
import * as physicalUser from '../controllers/physicalUserController';

const router = express.Router();

router
    .post('/legal-register', legalUser.registerUser)
    .post('/physical-register', physicalUser.registerUser)

    .post('/legal-login', legalUser.loginUser)
    .post('/physical-login', physicalUser.loginUser)

export default router;