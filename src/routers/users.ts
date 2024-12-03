import express from 'express';
import * as users from '../controllers/usersController';
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/all', validateJWT, users.getUsersByStatus)

export default router;