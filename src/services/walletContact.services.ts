import { PrismaClient } from '@prisma/client'
import ApiError from '../utils/ApiError'

const prisma = new PrismaClient()

class WalletContactServices {
  /**
   * Create a new wallet contact with phone number and OTP
   * @param phoneNo - The phone number of the wallet contact
   * @param otp - The OTP for verification
   * @returns The created wallet contact
   */
  async createWalletContact(phoneNo: string, otp: string) {
    const walletContact = await prisma.walletContact.create({
      data: {
        phoneNo,
        otp,
        isVerified: false,
        otpCreatedAt: new Date(),
        totalOTP: 1, // Set totalOTP to 1 when creating a new wallet contact
      },
    })
    return walletContact
  }

  /**
   * Update a wallet contact's OTP by phone number
   * @param phoneNo - The phone number of the wallet contact
   * @param otp - The new OTP for verification
   * @returns The updated wallet contact
   */
  async updateWalletContact(phoneNo: string, otp: string) {
    const walletContact = await prisma.walletContact.update({
      where: { phoneNo },
      data: {
        otp,
        otpCreatedAt: new Date(),
        totalOTP: {
          increment: 1, // Increment totalOTP by 1 when updating the wallet contact
        },
      },
    })
    return walletContact
  }

  /**
   * Get a wallet contact by phone number
   * @param phoneNo - The phone number of the wallet contact
   * @returns The wallet contact or null if not found
   */
  async getWalletContactByPhoneNo(phoneNo: string) {
    const walletContact = await prisma.walletContact.findUnique({
      where: { phoneNo },
    })
    return walletContact
  }

  /**
   * Block a wallet contact by phone number
   * @param phoneNo - The phone number of the wallet contact
   * @returns The updated wallet contact
   */
  async blockWalletContact(phoneNo: string) {
    const walletContact = await prisma.walletContact.update({
      where: { phoneNo },
      data: {
        isBlocked: true,
      },
    })
    return walletContact
  }

  /**
   * Unblock a wallet contact by phone number and reset totalOTP to 0
   * @param phoneNo - The phone number of the wallet contact
   * @returns The updated wallet contact
   */
  async unblockWalletContact(phoneNo: string) {
    const walletContact = await prisma.walletContact.update({
      where: { phoneNo },
      data: {
        isBlocked: false,
        totalOTP: 0, // Reset totalOTP to 0 when unblocking
      },
    })
    return walletContact
  }

  /**
   * Verify a wallet contact by phone number
   * @param phoneNo - The phone number of the wallet contact
   * @returns The updated wallet contact or null if verification fails
   */
  async verifyWalletContact(phoneNo: string) {
    const walletContact = await prisma.walletContact.update({
      where: { phoneNo },
      data: {
        isVerified: true,
      },
    })
    return walletContact
  }

  /**
   * Check the status of a wallet contact by phone number
   * @param phoneNo - The phone number of the wallet contact
   * @returns The status of the wallet contact
   */
  async checkWalletContact(phoneNo: string) {
    const walletContact = await prisma.walletContact.findUnique({
      where: { phoneNo },
    })
    // Check if wallet contact exists
    if (!walletContact) {
      throw new ApiError(404, 'Wallet contact not found')
    }
    // Check if wallet contact is blocked
    if (walletContact.isBlocked) {
      throw new ApiError(400, 'Wallet contact is blocked')
    }
    // Check if wallet contact is verified
    if (walletContact.isVerified) {
      return { isVerified: true }
    } else {
      throw new ApiError(400, 'Wallet contact is not verified')
    }
  }
}

export default new WalletContactServices()
