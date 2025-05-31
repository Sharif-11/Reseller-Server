import config from '../config'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import contactServices from './contact.services'
import SmsServices from './sms.services'
import Utility from './utility.services'

class OtpServices {
  /**
   * Send an OTP to a phone number
   * @param phoneNo - The phone number to send the OTP to
   * @returns A response object indicating the OTP sending status and verification status
   */
  async sendOtp(phoneNo: string) {
    let contact = await contactServices.getContactByPhoneNo(phoneNo)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phoneNo },
    })
    if (user) {
      throw new ApiError(
        400,
        'ফোন নম্বরটি ইতিমধ্যে একটি ব্যবহারকারীর সাথে যুক্ত।'
      )
    }

    // Check if OTP was sent recently
    if (contact?.otpCreatedAt) {
      const timeSinceLastOtp = Date.now() - contact.otpCreatedAt.getTime()
      if (timeSinceLastOtp < config.otpExpiresIn) {
        const timeLeft = Math.ceil(
          (config.otpExpiresIn - timeSinceLastOtp) / 1000
        )
        return {
          sendOTP: false,
          alreadySent: true,
          isBlocked: false,
          isVerified: false,
          message: `ইতিমধ্যে একটি ওটিপি পাঠানো হয়েছে। অনুগ্রহ করে ${timeLeft} সেকেন্ড পরে আবার চেষ্টা করুন।`,
        }
      }
    }

    if (!contact) {
      const otp = Utility.generateOtp()
      contact = await contactServices.createContact(phoneNo, otp)
      await SmsServices.sendOtp(phoneNo, otp)
      return { sendOTP: true, isBlocked: false, isVerified: false }
    }

    if (contact.isVerified) {
      return { isVerified: true, isBlocked: false, sendOTP: false }
    }

    if (contact.isBlocked) {
      throw new ApiError(
        403,
        'অতিরিক্ত ওটিপি অনুরোধের কারণে এই কন্টাক্টটি ব্লক করা হয়েছে।'
      )
    }

    if (contact.totalOTP >= config.maximumOtpAttempts) {
      await contactServices.blockContact(phoneNo)
      throw new ApiError(
        403,
        'বহুবার ওটিপি অনুরোধ করার কারণে কন্টাক্টটি ব্লক করা হয়েছে।'
      )
    }

    const otp = Utility.generateOtp()
    await contactServices.updateContact(phoneNo, otp)
    await SmsServices.sendOtp(phoneNo, otp)

    return { sendOTP: true, isBlocked: false, isVerified: false }
  }

  /**
   * Verify an OTP for a phone number
   * @param phoneNo - The phone number associated with the OTP
   * @param otp - The OTP to verify
   * @returns An object indicating OTP verification status
   */
  async verifyOtp(phoneNo: string, otp: string) {
    const contact = await contactServices.getContactByPhoneNo(phoneNo)

    if (!contact) {
      throw new ApiError(404, 'কন্টাক্ট পাওয়া যায়নি।')
    }

    if (!contact.otp || !contact.otpCreatedAt) {
      throw new ApiError(
        400,
        'ওটিপি পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
      )
    }
    if (contact.isVerified) {
      return { alreadyVerified: true }
    }

    const otpExpiryTime = new Date(
      contact.otpCreatedAt.getTime() + config.otpExpiresIn
    )

    if (new Date() > otpExpiryTime) {
      throw new ApiError(
        400,
        'ওটিপি মেয়াদোত্তীর্ণ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
      )
    }

    if (contact.otp !== otp) {
      throw new ApiError(400, 'ওটিপি সঠিক নয়।')
    }

    // Mark contact as verified
    await contactServices.verifyContact(phoneNo)

    return { otpVerified: true }
  }
}

export default new OtpServices()
