import { Router } from 'express'
import authControllers from '../controllers/auth.controllers'
const authRouter = Router()
authRouter.post('/send-otp', authControllers.sendOtp)
authRouter.post('/verify-otp', authControllers.verifyOtp)
authRouter.post('/login', authControllers.login)
authRouter.post('/create-admin', authControllers.createAdmin)
authRouter.post('/create-seller', authControllers.createSeller)
export default authRouter
