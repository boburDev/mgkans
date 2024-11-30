import express from 'express';
import * as comment from '../controllers/commentController';
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get('/all', validateJWT, comment.getAllComments)
    .get('/:productId', comment.getCommentsByProduct)
    .post("/create", comment.createProductComment)
    .post("/delete", validateJWT, comment.deleteProductComment)

export default router;