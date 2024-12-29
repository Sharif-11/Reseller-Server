import { Prisma } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import authServices from '../services/auth.services'
import Utility from '../services/utility.services'
class AuthController {
  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { mobileNo } = req.body
      const result = await authServices.sendOtp(mobileNo)
      res.status(200).json({
        statusCode: 200,
        success: true,
        message: result,
      })
    } catch (error) {
      next(error)
    }
  }
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { mobileNo, otp } = req.body
      const result = await authServices.verifyOtp(mobileNo, otp)
      res.status(200).json({
        statusCode: 200,
        success: true,
        message: result,
      })
    } catch (error) {
      next(error)
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { mobileNo, password } = req.body
      const result = await authServices.login({ mobileNo, password })
      //set cookie
      res.cookie('token', result.accessToken, {
        httpOnly: true,
      })
      res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'Login successful',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        mobileNo,
        password,
        zilla,
        address,
        name,
        email,
      }: Omit<Prisma.UserCreateInput, 'role'> = req.body
      const result = await authServices.createAdmin({
        mobileNo,
        password,
        zilla,
        name,
        address,
        email,
      })
      res.status(201).json({
        statusCode: 201,
        success: true,
        message: 'Admin created successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
  async createSeller(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        mobileNo,
        password,
        zilla,
        address,
        name,
        email,
      }: Omit<Prisma.UserCreateInput, 'role'> = req.body
      const result = await authServices.createSeller({
        mobileNo,
        password,
        zilla,
        name,
        address,
        email,
      })
      res.status(201).json({
        statusCode: 201,
        success: true,
        message: 'Seller created successfully',
        data: result,
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
        success: true,
        message: 'Logout successful',
      })
    } catch (error) {
      next(error)
    }
  }
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      const { name, email, address, zilla } = req.body
      const result = await authServices.updateProfile(userId as string, {
        userId,
        name,
        email,
        address,
        zilla,
      })
      res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'Profile updated successfully',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      const { oldPassword, newPassword } = req.body
      const result = await authServices.changePassword(userId as string, {
        oldPassword,
        newPassword,
      })
      res.status(200).json({
        statusCode: 200,
        success: true,
        message: result,
      })
    } catch (error) {
      next(error)
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { mobileNo } = req.body
      const newPassword = Utility.generateOtp()
      const result = await authServices.forgotPassword(mobileNo, newPassword)
      await Utility.sendSms(mobileNo, newPassword)
      res.status(200).json({
        statusCode: 200,
        success: true,
        message: result,
      })
    } catch (error) {
      next(error)
    }
  }
}
export default new AuthController()
