import { Prisma } from '@prisma/client'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import contactServices from './contact.services'
import otpServices from './otp.services'
import userServices from './user.services'
import Utility from './utility.services'

class AuthServices {
  /**
   * Create a new Admin user
   * @param phoneNo - The phone number of the admin user
   * @param name - The name of the admin
   * @param password - The password for the admin user
   * @returns The created admin user
   */
  async createAdmin({
    phoneNo,
    name,
    password,
    email,
    shopName,
    zilla,
    upazilla,
    address,
    nomineePhone,
  }: Prisma.UserCreateInput) {
    // Check if the user exists already
    const existingUser = await prisma.user.findUnique({
      where: { phoneNo },
    })

    if (existingUser) {
      throw new ApiError(400, 'এই ফোন নম্বরটি ইতিমধ্যেই ব্যবহৃত হয়েছে')
    }

    // Create the Admin user
    const hashedPassword = await Utility.hashPassword(password)
    const newUser = await prisma.user.create({
      data: {
        phoneNo,
        name,
        email,
        shopName,
        nomineePhone,
        role: 'Admin',
        password: hashedPassword,
        zilla,
        upazilla,
        address,
        isVerified: true, // Admins are verified by default
      },
    })

    return newUser
  }

  /**
   * Create a new Seller user
   * @param phoneNo - The phone number of the seller user
   * @param name - The name of the seller
   * @param password - The password for the seller user
   * @param email - The optional email of the seller
   * @param shopName - The shop name of the seller
   * @param nomineePhone - The optional nominee phone number of the seller
   * @returns The created seller user
   */
  async createSeller({
    phoneNo,
    name,
    password,
    email,
    shopName,
    zilla,
    upazilla,
    address,
    nomineePhone,
    referralCode,
  }: Prisma.UserCreateInput) {
    try {
      // Check if phone number already exists
      const existingUser = await prisma.user.findUnique({
        where: { phoneNo },
      })
      if (existingUser) {
        throw new ApiError(400, 'এই ফোন নম্বরটি ইতিমধ্যেই ব্যবহৃত হয়েছে')
      }

      // Check if contact exists and is verified
      const contact = await contactServices.getContactByPhoneNo(phoneNo)
      if (!contact) {
        throw new ApiError(400, 'এই ফোন নম্বরটি পাওয়া যায়নি')
      }
      if (!contact.isVerified) {
        throw new ApiError(400, 'এই ফোন নম্বরটি যাচাই করা হয়নি')
      }
      console.log({ email })
      // Check if email is already in use
      if (email) {
        const existingUserWithEmail = await prisma.user.findUnique({
          where: { email },
        })
        if (existingUserWithEmail) {
          throw new ApiError(400, 'এই ইমেইলটি ইতিমধ্যেই ব্যবহৃত হয়েছে')
        }
      }

      let referredByPhone: string | null = null

      // Handle referral code (if provided)
      if (referralCode) {
        const referrer = await prisma.user.findUnique({
          where: { referralCode },
          select: { phoneNo: true }, // Only fetch phone number
        })

        if (!referrer) {
          throw new ApiError(400, 'এই রেফারেল কোডটি সঠিক নয়')
        }

        referredByPhone = referrer.phoneNo
      }

      // Hash the password before storing
      const hashedPassword = await Utility.hashPassword(password)

      // Create the seller using an atomic transaction
      const newUser = await prisma.user.create({
        data: {
          phoneNo,
          name,
          email,
          shopName,
          nomineePhone,
          role: 'Seller',
          password: hashedPassword,
          zilla,
          upazilla,
          address,
          isVerified: false,
          referredByPhone, // Store referrer's phone number if exists
        },
        select: {
          userId: true,
          phoneNo: true,
          name: true,
          email: true,
          shopName: true,
          nomineePhone: true,
          role: true,
          zilla: true,
          upazilla: true,
          address: true,
          isVerified: true,
          referralCode: true,
          isLocked: true,
          createdAt: true,
          updatedAt: true,
          balance: true,
        },
      })

      return newUser
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      } else {
        throw new ApiError(
          500,
          'কিছু একটা সমস্যা হয়েছে। দয়া করে পরে আবার চেষ্টা করুন।'
        )
      }
    }
  }

  /**
   * Login using phone number and password
   * @param phoneNo - The phone number of the user
   * @param password - The password of the user
   * @returns The logged-in user and access token
   */
  async loginWithPhoneNoAndPassword(phoneNo: string, password: string) {
    const user = await userServices.getUserByPhoneNo(phoneNo)

    // Compare passwords
    const isPasswordValid = await Utility.comparePassword(
      password,
      user.password
    )
    if (!isPasswordValid) {
      throw new ApiError(400, 'পাসওয়ার্ড সঠিক নয়')
    }

    // Generate access token
    const token = Utility.generateAccessToken(
      user.userId,
      user.role,
      user.phoneNo
    )

    return { user, token }
  }

  /**
   * Send OTP to the phone number for verification
   * @param phoneNo - The phone number to send the OTP to
   * @returns The OTP sending status
   */
  async sendOtp(phoneNo: string) {
    return otpServices.sendOtp(phoneNo)
  }

  /**
   * Verify OTP for the phone number
   * @param phoneNo - The phone number to verify
   * @param otp - The OTP to verify
   * @returns OTP verification status
   */
  async verifyOtp(phoneNo: string, otp: string) {
    return otpServices.verifyOtp(phoneNo, otp)
  }

  /**
   * Update user profile information
   * @param userId - The user ID of the user
   * @param updates - The fields to be updated
   * @returns The updated user object
   */
  async updateProfile(userId: string, updates: any) {
    return userServices.updateProfile(userId, updates)
  }

  /**
   * Update user password
   * @param userId - The user ID of the user
   * @param currentPassword - The current password of the user
   * @param newPassword - The new password
   * @returns The updated user object
   */
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    // Check if the user exists
    console.log({ userId, currentPassword, newPassword })
    const user = await userServices.getUserByUserId(userId)
    console.log({ user })
    // Compare current password
    const isPasswordValid = await Utility.comparePassword(
      currentPassword,
      user.password
    )
    console.log({ isPasswordValid })
    if (!isPasswordValid) {
      throw new ApiError(400, 'বর্তমান পাসওয়ার্ড সঠিক নয়')
    }

    // Hash new password
    const hashedPassword = await Utility.hashPassword(newPassword)

    // Update password
    return userServices.updatePassword(userId, hashedPassword)
  }

  /**
   * Add referral code for the user
   * @param userId - The user ID of the user
   * @param referralCode - The referral code to be added
   * @returns The updated user with referral code
   */
  async addReferralCode(userId: string, referralCode: string) {
    return userServices.addReferralCode(userId, referralCode)
  }

  /**
   * Get a specific user by phone number
   * @param phoneNo - The phone number of the user
   * @returns The user object
   */
  async getUserByPhoneNo(phoneNo: string) {
    return userServices.getUserByPhoneNo(phoneNo)
  }

  /**
   * Get all users
   * @returns The list of all users
   */
  async getAllUsers(
    filters: { phoneNo?: string; name?: string } = {},
    page?: number,
    pageSize?: number
  ) {
    return userServices.getAllUsers(filters, page, pageSize)
  }
  /**
   * Handle Forgot Password
   * @param phoneNo - The phone number of the user requesting the password reset
   * @returns A status message indicating the result
   */
  async forgotPassword(phoneNo: string) {
    return await userServices.forgotPassword(phoneNo)
  }
}

export default new AuthServices()
