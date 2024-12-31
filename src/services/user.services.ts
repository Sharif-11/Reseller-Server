import { Prisma, User } from '@prisma/client'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import contactServices from './contact.services'

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
  async addBalance(userId: string, amount: number): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { userId },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

    if (amount <= 0) {
      throw new ApiError(400, 'পরিমাণটি বৈধ হতে হবে')
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        balance: user.balance + amount,
      },
    })

    return updatedUser
  }

  /**
   * Withdraw balance from the user's account
   * @param userId - The user ID of the user
   * @param amount - The amount to withdraw from the balance
   * @returns The updated user object with the new balance
   */
  async withdrawBalance(userId: string, amount: number): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { userId },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

    if (amount <= 0) {
      throw new ApiError(400, 'পরিমাণটি বৈধ হতে হবে')
    }

    if (user.balance < amount) {
      throw new ApiError(400, 'অপর্যাপ্ত ব্যালেন্স')
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        balance: user.balance - amount,
      },
    })

    return updatedUser
  }

  /**
   * Add or update the referral code for the user
   * @param userId - The user ID of the user
   * @param referralCode - The referral code to be added or updated
   * @returns The updated user object
   */
  async addReferralCode(userId: string, referralCode: string): Promise<User> {
    // Check if the referral code is unique
    await this.checkReferralCodeUnique(referralCode)

    const user = await prisma.user.findUnique({
      where: { userId },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

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
  /**
   * Get all users with filters (phoneNo, name), pagination is optional
   * @param filters - The filters for searching users (phoneNo, name)
   * @param page - The page number for pagination (optional)
   * @param pageSize - The number of users per page (optional)
   * @returns The list of users that match the filters
   */
  async getAllUsers(
    filters: { phoneNo?: string; name?: string } = {},
    page?: number,
    pageSize?: number
  ): Promise<User[]> {
    const query: Prisma.UserFindManyArgs = {
      where: {
        phoneNo: filters.phoneNo ? { contains: filters.phoneNo } : undefined,
        name: filters.name ? { contains: filters.name } : undefined,
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

    return users
  }
}

export default new UserServices()
