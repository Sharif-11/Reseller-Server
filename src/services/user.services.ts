import { Prisma, User } from '@prisma/client'
import config from '../config'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import contactServices from './contact.services'
import SmsServices from './sms.services'
import transactionServices from './transaction.services'
import Utility from './utility.services'

class UserServices {
  /**
   * Helper method to check if a referral code is unique
   * @param referralCode - The referral code to check
   * @throws ApiError if the referral code is already in use
   */
  private async checkReferralCodeUnique(referralCode: string): Promise<void> {
    const existingReferralCode = await prisma.user.findUnique({
      where: { referralCode },
    })

    if (existingReferralCode) {
      throw new ApiError(400, 'এই রেফারেল কোডটি ইতিমধ্যেই ব্যবহৃত হয়েছে')
    }
  }

  /**
   * Get a user by phone number
   * @param phoneNo - The phone number of the user
   * @returns The user object or throws an error if not found
   */
  async getUserByPhoneNo(phoneNo: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { phoneNo },
      include: {
        wallets: true,
      },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

    return user
  }

  /**
   * Get a user by userId
   * @param userId - The user ID of the user
   * @returns The user object or throws an error if not found
   */
  async getUserByUserId(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        wallets: true,
      },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

    return user
  }
  async getUserDetailByUserId({
    tx,
    userId,
  }: {
    tx: Prisma.TransactionClient
    userId: string
  }) {
    const user = await tx.user.findUnique({
      where: { userId },
      include: {
        wallets: true,
        referredBy: true,
        referrals: true,
      },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

    return user
  }

  /**
   * Get a user by email
   * @param email - The email of the user
   * @returns The user object or throws an error if not found
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new ApiError(404, 'ইমেল দ্বারা ব্যবহারকারী পাওয়া যায়নি')
    }

    return user
  }

  /**
   * Verify a user
   * @param userId - The user ID of the user to be verified
   * @returns The updated user object
   */
  async verifyUser(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { userId },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

    if (user.isVerified) {
      throw new ApiError(400, 'এই ব্যবহারকারী ইতিমধ্যেই যাচাই করা হয়েছে')
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: { isVerified: true },
    })

    return updatedUser
  }

  /**
   * Add balance to the user's account
   * @param userId - The user ID of the user
   * @param amount - The amount to add to the balance
   * @returns The updated user object with the new balance
   */

  /**
   * Add or update the referral code for the user
   * @param userId - The user ID of the user
   * @param referralCode - The referral code to be added or updated
   * @returns The updated user object
   */
  async addReferralCode(userId: string, referralCode: string): Promise<User> {
    // Check if the referral code is unique

    const user = await prisma.user.findUnique({
      where: { userId },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }
    if (!user.isVerified) {
      throw new ApiError(
        400,
        'You are not a verified seller yet. Please confirm minimum 1 order to get verified.'
      )
    }
    if (user.referralCode) {
      throw new ApiError(400, 'You have already added a referral code.')
    }
    await this.checkReferralCodeUnique(referralCode)
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        referralCode,
      },
    })

    return updatedUser
  }

  /**
   * Create a new user
   * @param phoneNo - The phone number of the user
   * @param name - The name of the user
   * @param zilla - The district of the user
   * @param upazilla - The sub-district of the user
   * @param address - The address of the user
   * @param password - The password for the user
   * @param email - The optional email of the user
   * @param shopName - The optional shop name for the user
   * @param nomineePhone - The optional nominee phone number
   * @param role - The role of the user (Admin or Seller)
   * @returns The created user object
   */
  async createUser({
    phoneNo,
    name,
    zilla,
    upazilla,
    address,
    password,
    email,
    shopName,
    nomineePhone,
    role,
  }: Prisma.UserCreateInput): Promise<User> {
    // Check if contact exists and is verified
    const contact = await contactServices.getContactByPhoneNo(phoneNo)
    if (!contact) {
      throw new ApiError(404, 'যোগাযোগ নম্বর পাওয়া যায়নি')
    }
    if (!contact.isVerified) {
      throw new ApiError(400, 'যোগাযোগ নম্বরটি এখনও যাচাই করা হয়নি')
    }

    // Check if user with the phone number or email already exists
    const existingUser = await prisma.user.findUnique({ where: { phoneNo } })
    if (existingUser) {
      throw new ApiError(
        400,
        'এই ফোন নম্বরটি ইতিমধ্যেই একটি ব্যবহারকারীর সাথে যুক্ত'
      )
    }
    if (email) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email },
      })
      if (existingEmailUser) {
        throw new ApiError(
          400,
          'এই ইমেলটি ইতিমধ্যেই একটি ব্যবহারকারীর সাথে যুক্ত'
        )
      }
    }

    // Hash the password

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        phoneNo,
        name,
        zilla,
        upazilla,
        address,
        password,
        email,
        shopName,
        nomineePhone,
        role: role || 'Seller', // Default role is 'Seller'
        isVerified: false, // Default to false for safety
      },
    })

    return newUser
  }

  /**
   * Update the user's profile information
   * @param userId - The user ID of the user
   * @param updates - The fields to be updated (name, zilla, upazilla, address, email, shopName, nomineePhone)
   * @returns The updated user object
   */
  async updateProfile(
    userId: string,
    updates: {
      name?: string
      zilla?: string
      upazilla?: string
      address?: string
      email?: string
      shopName?: string
      nomineePhone?: string
    }
  ): Promise<User> {
    // console.log({ userId, updates })
    const user = await prisma.user.findUnique({
      where: { userId },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: updates,
    })

    return updatedUser
  }

  /**
   * Update the user's password
   * @param userId - The user ID of the user
   * @param currentPassword - The current password of the user
   * @param newPassword - The new password to be set
   * @returns The updated user object
   */
  async updatePassword(userId: string, newPassword: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { userId },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        password: newPassword,
      },
    })

    return updatedUser
  }
  async forgotPassword(phoneNo: string) {
    const newPassword = Utility.generateOtp()
    const hashedPassword = await Utility.hashPassword(newPassword)

    const user = await prisma.user.findUnique({ where: { phoneNo } })

    if (!user) {
      throw new ApiError(
        404,
        'এই ফোন নম্বর দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি'
      )
    }

    if (user.isLocked && user.role !== 'Admin') {
      throw new ApiError(
        400,
        'আপনার অ্যাকাউন্ট লক করা হয়েছে। আনলক করতে আপনার অ্যাকাউন্ট রিচার্জ করুন।'
      )
    }

    // Check if password was requested recently
    if (user.passwordSendAt) {
      const timeSinceLastRequest = Date.now() - user.passwordSendAt.getTime()
      if (timeSinceLastRequest < config.forgotPasswordRequestInterval) {
        const timeLeft = Math.ceil(
          (config.forgotPasswordRequestInterval - timeSinceLastRequest) /
            1000 /
            60
        ) // Convert to minutes
        throw new ApiError(
          429,
          `পাসওয়ার্ড ইতিমধ্যেই পাঠানো হয়েছে। অনুগ্রহ করে ${timeLeft} মিনিট পরে আবার চেষ্টা করুন।`
        )
      }
    }

    // Use transaction for atomic operations
    return await prisma.$transaction(async tx => {
      // Update password first
      await tx.user.update({
        where: { phoneNo },
        data: {
          password: hashedPassword,
          passwordSendAt: new Date(), // Update the timestamp
        },
      })

      // Handle SMS charges based on user role and attempt count
      if (user.role !== 'Admin') {
        if (user.forgotPasswordSmsCount < config.maxForgotPasswordAttempts) {
          // Free SMS - just increment count
          await tx.user.update({
            where: { phoneNo },
            data: { forgotPasswordSmsCount: { increment: 1 } },
          })
        } else {
          // Paid SMS - deduct charge
          await transactionServices.deductSmsChargeForForgotPassword({
            tx,
            userId: user.userId,
            amount: config.smsCharge,
            phoneNo: user.phoneNo,
            name: user.name,
            remarks: 'পাসওয়ার্ড রিসেট এসএমএস চার্জ',
          })

          // Also increment attempt count
          await tx.user.update({
            where: { phoneNo },
            data: { forgotPasswordSmsCount: { increment: 1 } },
          })
        }
      }

      // Send SMS in all cases
      await SmsServices.sendPassword(user.phoneNo, newPassword)

      return { sendPassword: true }
    })
  }
  /**
   * Get all users with filters (phoneNo, name), pagination is optional
   * @param filters - The filters for searching users (phoneNo, name)
   * @param page - The page number for pagination (optional)
   * @param pageSize - The number of users per page (optional)
   * @returns The list of users that match the filters
   */
  async getAllSellers(
    phoneNo?: string,
    name?: string,
    page?: number,
    pageSize?: number
  ) {
    const query: Prisma.UserFindManyArgs = {
      where: {
        phoneNo: phoneNo ? { contains: phoneNo } : undefined,
        name: name ? { contains: name } : undefined,
        role: 'Seller',
      },
      select: {
        userId: true,
        phoneNo: true,
        name: true,
        zilla: true,
        upazilla: true,
        address: true,
        email: true,
        shopName: true,
        nomineePhone: true,
        role: true,
        isVerified: true,
        balance: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
        // Omit password
      },
    }

    if (page && pageSize) {
      query['skip'] = (page - 1) * pageSize
      query['take'] = pageSize
    }

    const users = await prisma.user.findMany(query)

    // we need to calculate total Page also
    const totalUsers = await prisma.user.count({
      where: {
        phoneNo: phoneNo ? { contains: phoneNo } : undefined,
        name: name ? { contains: name } : undefined,
        role: 'Seller',
      },
    })
    const totalPages = Math.ceil(totalUsers / (pageSize || 10))

    return {
      users,
      totalUsers,
      totalPages,
    }
  }
  // unlock user
  async unlockUser(phoneNo: string) {
    const user = await prisma.user.findUnique({ where: { phoneNo } })

    if (!user)
      throw new ApiError(
        404,
        'এই ফোন নম্বর দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি'
      )

    await prisma.user.update({
      where: { phoneNo },
      data: { isLocked: false, forgotPasswordSmsCount: 0 },
    })

    return { unLocked: true }
  }
  async getAdminForTheUsers() {
    const admins = await prisma.user.findFirst({
      where: {
        role: 'Admin',
      },
      select: {
        userId: true,
      },
    })
    return admins
  }
}

export default new UserServices()
