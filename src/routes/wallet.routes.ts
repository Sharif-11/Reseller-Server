import { Router } from 'express'
import walletOTPControllers from '../controllers/walletOTP.controllers'
import walletsControllers from '../controllers/wallets.controllers'
import validateRequest from '../middlewares/validation.middleware'
import {
  validateSendOtp,
  validateVerifyOtp,
} from '../Validators/auth.validators'

const walletRouter = Router()

// Route to add a new wallet
walletRouter.post('/', walletsControllers.addWallet)

// Route to get all wallets of a specific user
walletRouter.get('/', walletsControllers.getWallets)
walletRouter.post(
  '/send-otp',
  validateSendOtp,
  validateRequest,
  walletOTPControllers.sendOtp
)
walletRouter.post(
  '/verify-otp',
  validateVerifyOtp,
  validateRequest,
  walletOTPControllers.verifyOtp
)

export default walletRouter
