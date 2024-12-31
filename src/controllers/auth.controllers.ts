import { NextFunction, Request, Response } from 'express'
import AuthServices from '../services/auth.services'
import otpServices from '../services/otp.services'

class AuthController {
  /**
   * Create a new Admin user
   */
  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const adminData = req.body
      const newUser = await AuthServices.createAdmin(adminData)
      const { password, ...user } = newUser
      res.status(201).json({
        statusCode: 201,
        message: 'অ্যাডমিন সফলভাবে তৈরি হয়েছে',
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create a new Seller user
   */
  async createSeller(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerData = req.body
      const newUser = await AuthServices.createSeller(sellerData)
      const { password, ...user } = newUser
      res.status(201).json({
        statusCode: 201,
        message: 'সেলার সফলভাবে তৈরি হয়েছে',
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Login user using phone number and password
   */
  async loginWithPhoneNoAndPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { phoneNo, password } = req.body
      const { user, token } = await AuthServices.loginWithPhoneNoAndPassword(
        phoneNo,
        password
      )
      const { password: _, ...userWithoutPassword } = user
      res.cookie('token', token, { httpOnly: true })
      res.status(200).json({
        statusCode: 200,
        message: 'লগইন সফল',
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
      })
    } catch (error) {
      next(error)
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token')
      res.status(200).json({
        statusCode: 200,
        message: 'লগআউট সফল',
        success: true,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Send OTP for phone number verification
   */
  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNo } = req.body
      const data = await otpServices.sendOtp(phoneNo)
      res.status(200).json({
        statusCode: 200,
        message: data?.isVerified
          ? 'এই নম্বরটি ইতিমধ্যে যাচাই করা হয়েছে'
          : 'OTP সফলভাবে পাঠানো হয়েছে',
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Verify OTP for phone number verification
   */
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNo, otp } = req.body
      const data = await AuthServices.verifyOtp(phoneNo, otp)
      res.status(200).json({
        statusCode: 200,
        message: 'OTP সফলভাবে যাচাই করা হয়েছে',
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update user profile information
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      const updates = req.body
      const updatedUser = await AuthServices.updateProfile(
        userId as string,
        updates
      )
      const { password, ...user } = updatedUser
      res.status(200).json({
        statusCode: 200,
        message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে',
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update user password
   */
  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      const { currentPassword, newPassword } = req.body
      const updatedUser = await AuthServices.updatePassword(
        userId as string,
        currentPassword,
        newPassword
      )
      const { password, ...user } = updatedUser
      res.status(200).json({
        statusCode: 200,
        message: 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে',
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Add referral code for the user
   */
  async addReferralCode(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      const { referralCode } = req.body
      const updatedUser = await AuthServices.addReferralCode(
        userId as string,
        referralCode
      )
      res.status(200).json({
        statusCode: 200,
        message: 'রেফারেল কোড সফলভাবে যোগ করা হয়েছে',
        success: true,
        data: updatedUser,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get a specific user by phone number
   */
  async getUserByPhoneNo(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNo } = req.params
      const user = await AuthServices.getUserByPhoneNo(phoneNo)
      res.status(200).json({
        statusCode: 200,
        message: 'ব্যবহারকারী সফলভাবে পাওয়া গেছে',
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get all users with optional filters
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNo, name } = req.query
      const filters = {
        phoneNo: phoneNo ? String(phoneNo) : undefined,
        name: name ? String(name) : undefined,
      }
      const { page = 1, pageSize = 10 } = req.query
      const users = await AuthServices.getAllUsers(
        filters,
        Number(page),
        Number(pageSize)
      )
      res.status(200).json({
        statusCode: 200,
        message: 'সব ব্যবহারকারী সফলভাবে পাওয়া গেছে',
        success: true,
        data: users,
      })
    } catch (error) {
      next(error)
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNo } = req.body
      const data = await AuthServices.forgotPassword(phoneNo)
      res.status(200).json({
        statusCode: 200,
        message: 'নতুন পাসওয়ার্ড আপনার মোবাইল নম্বরে পাঠানো হয়েছে',
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new AuthController()
