import express from 'express'
import authRouter from "./auth";
import adminRouter from "./admin";
import profileRouter from "./profile";
import categoryRouter from "./category";
import productRouter from "./products";
import favourRouter from "./favour";
import orderRouter from "./orders";
import adsRouter from "./advertise";
import saleRouter from "./sale";
import recommendRouter from "./recommend";
import commentRouter from "./comments";
import userRouter from "./users";

const router = express.Router();

router.use('/auth', authRouter)
router.use('/admin', adminRouter)
router.use('/profile', profileRouter)
router.use('/category', categoryRouter)
router.use('/product', productRouter)
router.use('/favour', favourRouter)
router.use('/order', orderRouter)
router.use('/ads', adsRouter)
router.use('/sale', saleRouter)
router.use('/recommend', recommendRouter)
router.use('/comment', commentRouter)
router.use('/user', userRouter)

export default router