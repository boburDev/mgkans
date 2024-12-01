import express from 'express';
import * as comment from '../controllers/commentController';
import { validateJWT } from '../middlewares/validateAdmin';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router
    .get('/all', validateJWT, comment.getAllComments)
    .get('/user', authMiddleware, comment.getAllCommentsByUser)
    .get('/:productId', comment.getCommentsByProduct)
    .post("/create", authMiddleware, comment.createProductComment)
    .post("/delete", validateJWT, comment.deleteProductComment)

export default router;