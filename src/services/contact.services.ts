import { PrismaClient } from '@prisma/client'
import ApiError from '../utils/ApiError'

const prisma = new PrismaClient()

class ContactServices {
  /**
   * Create a new contact with phone number and OTP
   * @param phoneNo - The phone number of the contact
   * @param otp - The OTP for verification
   * @returns The created contact
   */
  async createContact(phoneNo: string, otp: string) {
    const contact = await prisma.contact.create({
      data: {
        phoneNo,
        otp,
        isVerified: false,
        otpCreatedAt: new Date(),
        totalOTP: 1, // Set totalOTP to 1 when creating a new contact
      },
    })
    return contact
  }

  /**
   * Update a contact's OTP by phone number
   * @param phoneNo - The phone number of the contact
   * @param otp - The new OTP for verification
   * @returns The updated contact
   */
  async updateContact(phoneNo: string, otp: string) {
    const contact = await prisma.contact.update({
      where: { phoneNo },
      data: {
        otp,
        otpCreatedAt: new Date(),
        totalOTP: {
          increment: 1, // Increment totalOTP by 1 when updating the contact
        },
      },
    })
    return contact
  }

  /**
   * Get a contact by phone number
   * @param phoneNo - The phone number of the contact
   * @returns The contact or null if not found
   */
  async getContactByPhoneNo(phoneNo: string) {
    const contact = await prisma.contact.findUnique({
      where: { phoneNo },
    })
    return contact
  }

  /**
   * Block a contact by phone number
   * @param phoneNo - The phone number of the contact
   * @returns The updated contact
   */
  async blockContact(phoneNo: string) {
    const contact = await prisma.contact.update({
      where: { phoneNo },
      data: {
        isBlocked: true,
      },
    })
    return contact
  }

  /**
   * Unblock a contact by phone number and reset totalOTP to 0
   * @param phoneNo - The phone number of the contact
   * @returns The updated contact
   */
  async unblockContact(phoneNo: string) {
    const contact = await prisma.contact.update({
      where: { phoneNo },
      data: {
        isBlocked: false,
        totalOTP: 0, // Reset totalOTP to 0 when unblocking
      },
    })
    return contact
  }

  /**
   * Verify a contact by phone number and OTP
   * @param phoneNo - The phone number of the contact
   * @param otp - The OTP to verify
   * @returns The updated contact or null if verification fails
   */
  async verifyContact(phoneNo: string) {
    // Mark contact as verified
    const contact = await prisma.contact.update({
      where: { phoneNo },
      data: {
        isVerified: true,
      },
    })

    return contact
  }
  async checkContact(phoneNo: string) {
    const contact = await prisma.contact.findUnique({
      where: { phoneNo },
    })
    // check if contact is exist
    if (!contact) {
      throw new ApiError(404, 'Contact not found')
    }
    // check if contact is blocked
    if (contact.isBlocked) {
      throw new ApiError(400, 'Contact is blocked')
    }
    // check if contact is verified
    if (contact.isVerified) {
      return { isVerified: true }
    } else {
      throw new ApiError(400, 'Contact is not verified')
    }
  }
  async checkContactVerified(phoneNo: string) {
    const contact = await prisma.contact.findUnique({
      where: { phoneNo },
    })
    // check if contact is exist
    if (!contact) {
      throw new ApiError(404, 'কন্টাক্ট পাওয়া যায়নি')
    }
    // check if contact is blocked
    if (contact.isBlocked) {
      throw new ApiError(400, 'কন্টাক্ট ব্লক করা আছে')
    }
    // check if contact is verified
    if (contact.isVerified) {
      return { isVerified: true }
    } else {
      return { isVerified: false }
    }
  }
}

export default new ContactServices()
