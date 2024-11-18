import express from 'express'
import authRouter from "./auth";
import categoryRouter from "./category";
import productRouter from "./products";

const router = express.Router();

router.use('/auth', authRouter)
router.use('/category', categoryRouter)
router.use('/product', productRouter)

export default router