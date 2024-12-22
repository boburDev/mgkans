import express from 'express';
import * as discount from '../controllers/discountController';
import { validateJWT } from '../middlewares/validateAdmin';

const router = express.Router();

router
    .get("/all", discount.getDiscounts)
    .post("/create", validateJWT, discount.createDiscount)
    .post("/update/:id", validateJWT, discount.updateDiscount)
    .post("/delete/:id", validateJWT, discount.deleteDiscount)

export default router;