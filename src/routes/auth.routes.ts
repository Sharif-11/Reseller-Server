import { Router } from 'express'
import authControllers from '../controllers/auth.controllers'
import { isAuthenticated } from '../middlewares/auth.middlewares'
import validateRequest from '../middlewares/validation.middleware'
import {
  validateChangePassword,
  validateCreateAdmin,
  validateCreateSeller,
  validateForgotPassword,
  validateLoginWithPhoneNoAndPassword,
  validateSendOtp,
  validateUpdateProfile,
  validateVerifyOtp,
} from '../Validators/auth.validators'
const authRouter = Router()
authRouter.post(
  '/send-otp',
  validateSendOtp,
  validateRequest,
  authControllers.sendOtp,
)
authRouter.post(
  '/verify-otp',
  validateVerifyOtp,
  validateRequest,
  authControllers.verifyOtp,
)
authRouter.post(
  '/login',
  validateLoginWithPhoneNoAndPassword,
  validateRequest,
  authControllers.loginWithPhoneNoAndPassword,
)
authRouter.post('/logout', isAuthenticated, authControllers.logout)
authRouter.post(
  '/create-admin',
  validateCreateAdmin,
  validateRequest,
  authControllers.createAdmin,
)
authRouter.post(
  '/create-seller',
  validateCreateSeller,
  validateRequest,
  authControllers.createSeller,
)
authRouter.patch(
  '/change-password',
  isAuthenticated,
  validateChangePassword,
  validateRequest,
  authControllers.updatePassword,
)
authRouter.patch(
  '/update-profile',
  isAuthenticated,
  validateUpdateProfile,
  validateRequest,
  authControllers.updateProfile,
)
authRouter.post(
  '/forgot-password',
  validateForgotPassword,
  validateRequest,
  authControllers.forgotPassword,
)

export default authRouter
