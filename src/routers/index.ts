import express from 'express'
import authRouter from "./auth";
import profileRouter from "./profile";
import categoryRouter from "./category";
import productRouter from "./products";

const router = express.Router();

router.use('/auth', authRouter)
router.use('/profile', profileRouter)
router.use('/category', categoryRouter)
router.use('/product', productRouter)

export default router