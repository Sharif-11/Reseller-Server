import { Router } from 'express'
import authControllers from '../controllers/auth.controllers'
import { isAuthenticated } from '../middlewares/auth.middlewares'
const authRouter = Router()
authRouter.post('/send-otp', authControllers.sendOtp)
authRouter.post('/verify-otp', authControllers.verifyOtp)
authRouter.post('/login', authControllers.login)
authRouter.post('/logout', authControllers.logout)
authRouter.post('/create-admin', authControllers.createAdmin)
authRouter.post('/create-seller', authControllers.createSeller)
authRouter.patch(
  '/change-password',
  isAuthenticated,
  authControllers.changePassword
)
authRouter.patch(
  '/update-profile',
  isAuthenticated,
  authControllers.updateProfile
)
authRouter.post('/forgot-password', authControllers.forgotPassword)

export default authRouter
