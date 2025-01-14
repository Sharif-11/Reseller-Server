import { NextFunction, Request, Response } from 'express'
import walletOTPServices from '../services/walletOTP.services'

class WalletOtpController {
  /**
   * Send an OTP to a phone number
   */
  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNo } = req.body
      const userPhoneNo = req.user?.mobileNo
      if (phoneNo === userPhoneNo) {
        res.status(200).json({
          statusCode: 200,
          message: 'phone number already verified',
          success: true,
          data: { otpVerified: true },
        })
      } else {
        const sendResponse = await walletOTPServices.sendOtp(phoneNo)
        res.status(200).json({
          statusCode: 200,
          message: 'OTP sent successfully',
          success: true,
          data: sendResponse,
        })
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * Verify an OTP for a phone number
   */
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNo, otp } = req.body
      const verifyResponse = await walletOTPServices.verifyOtp(phoneNo, otp)

      res.status(200).json({
        statusCode: 200,
        message: verifyResponse.otpVerified
          ? 'OTP verified successfully'
          : 'OTP already verified',
        success: true,
        data: verifyResponse,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new WalletOtpController()
