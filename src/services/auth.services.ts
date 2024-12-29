import { Prisma } from '@prisma/client'
import config from '../config'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import Utility from './utility.services'

class AuthService {
  async sendOtp(mobileNo: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          mobileNo,
        },
      })
      if (user) {
        throw new ApiError(400, 'User already exists')
      }
      const otp = Utility.generateOtp()
      const otpCreatedAt = new Date()
      //check if mobile number already exists in contacts
      const contact = await prisma.contact.findUnique({
        where: {
          mobileNo,
        },
      })
      if (contact) {
        if (contact.isVerified) {
          return 'Mobile number already verified'
        }
        await prisma.contact.update({
          where: {
            mobileNo,
          },
          data: {
            otp,
            otp_created_at: otpCreatedAt,
            isVerified: false,
          },
        })
      } else {
        await prisma.contact.create({
          data: {
            mobileNo,
            otp,
            otp_created_at: otpCreatedAt,
            isVerified: false,
          },
        })
      }
      await Utility.sendOtp(mobileNo, otp)
      return 'OTP sent successfully'
    } catch (error) {
      console.error('Error sending OTP: ', error)
      throw error
    }
  }
  async verifyOtp(mobileNo: string, otp: string) {
    const contact = await prisma.contact.findUnique({
      where: {
        mobileNo,
      },
    })
    if (!contact) {
      throw new ApiError(400, 'Mobile number not found')
    }
    if (contact.isVerified) {
      return 'Mobile number already verified'
    }

    if (contact.otp !== otp) {
      throw new ApiError(400, 'Invalid OTP')
    }
    //check if OTP is expired
    const otpCreatedAt = contact!.otp_created_at
    const currentTime = new Date()
    const diff = currentTime.getTime() - otpCreatedAt!.getTime()
    if (diff > config.otpExpiresIn) {
      throw new ApiError(400, 'OTP expired')
    }
    const result = await prisma.contact.update({
      where: {
        mobileNo,
      },
      data: {
        isVerified: true,
      },
    })
    return 'OTP verified successfully'
  }
  async createAdmin({
    mobileNo,
    password,
    name,
    zilla,
    address,
    email,
  }: Omit<Prisma.UserCreateInput, 'role'>) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          mobileNo,
        },
      })
      if (user) {
        throw new ApiError(400, 'User already exists')
      }
      //check if mobile number is verified
      const contact = await prisma.contact.findUnique({
        where: {
          mobileNo,
        },
      })
      if (!contact || !contact.isVerified) {
        throw new ApiError(400, 'Mobile number is not verified')
      }
      const hashedPassword = await Utility.hashPassword(password)
      const admin = await prisma.user.create({
        data: {
          mobileNo,
          password: hashedPassword,
          role: 'Admin',
          name,
          zilla,
          address,
          email,
        },
      })
      const { password: _, ...adminWithoutPassword } = admin
      return adminWithoutPassword
    } catch (error) {
      throw error
    }
  }
  async createSeller({
    mobileNo,
    password,
    name,
    zilla,
    address,
    email,
  }: Omit<Prisma.UserCreateInput, 'role'>) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          mobileNo,
        },
      })
      if (user) {
        throw new ApiError(400, 'User already exists')
      }
      //check if mobile number is verified
      const contact = await prisma.contact.findUnique({
        where: {
          mobileNo,
        },
      })
      if (!contact || !contact.isVerified) {
        throw new ApiError(400, 'Mobile number is not verified')
      }
      const hashedPassword = await Utility.hashPassword(password)
      const seller = await prisma.user.create({
        data: {
          mobileNo,
          password: hashedPassword,
          role: 'Seller',
          name,
          zilla,
          address,
          email,
        },
      })
      const { password: _, ...sellerWithoutPassword } = seller
      return sellerWithoutPassword
    } catch (error) {
      throw error
    }
  }
  async login({ mobileNo, password }: Prisma.UserWhereUniqueInput) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          mobileNo,
        },
      })
      if (!user) {
        throw new ApiError(400, 'User not found')
      }
      const isPasswordMatch = await Utility.comparePassword(
        password as string,
        user.password
      )
      if (!isPasswordMatch) {
        throw new ApiError(400, 'Invalid password')
      }
      const accessToken = Utility.generateAccessToken(
        user.userId,
        user.role,
        user.mobileNo
      )
      const { password: _, ...userWithoutPassword } = user
      return { user: userWithoutPassword, accessToken }
    } catch (error) {
      console.error('Error logging in: ', error)
      throw error
    }
  }
  async updateProfile(
    userId: string,
    {
      name,
      address,
      email,
      zilla,
      shopName,
    }: Omit<Prisma.UserUpdateInput, 'role' | 'mobileNo' | 'password'>
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          userId,
        },
      })
      if (!user) {
        throw new ApiError(400, 'User not found')
      }
      const updatedUser = await prisma.user.update({
        where: {
          userId,
        },
        data: {
          name,
          address,
          email,
          zilla,
          shopName,
        },
      })
      const { password: _, ...userWithoutPassword } = updatedUser
      return userWithoutPassword
    } catch (error) {
      throw error
    }
  }
  async changePassword(
    userId: string,
    { oldPassword, newPassword }: { oldPassword: string; newPassword: string }
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          userId,
        },
      })
      if (!user) {
        throw new ApiError(400, 'User not found')
      }
      const isPasswordMatch = await Utility.comparePassword(
        oldPassword,
        user.password
      )
      if (!isPasswordMatch) {
        throw new ApiError(400, 'Invalid password')
      }
      const hashedPassword = await Utility.hashPassword(newPassword)
      await prisma.user.update({
        where: {
          userId,
        },
        data: {
          password: hashedPassword,
        },
      })
      return 'Password changed successfully'
    } catch (error) {
      throw error
    }
  }
  async forgotPassword(mobileNo: string, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          mobileNo,
        },
      })
      if (!user) {
        throw new ApiError(400, 'User not found')
      }
      const hashedPassword = await Utility.hashPassword(newPassword)
      await prisma.user.update({
        where: {
          mobileNo,
        },
        data: {
          password: hashedPassword,
        },
      })
      return 'Password changed successfully'
    } catch (error) {
      throw error
    }
  }
}

export default new AuthService()
