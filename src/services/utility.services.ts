import axios from 'axios'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../config'
export class Utility {
  /**
   * Hash a password
   * @param password - Plain text password
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, Number(config.saltRounds))
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns Boolean indicating whether the passwords match
   */
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Generate a 6-digit OTP
   * @returns A string representing the OTP
   */
  static generateOtp(): string {
    return Array.from({ length: config.otpLength }, () =>
      Math.floor(Math.random() * 10)
    ).join('')
  }

  /**
   * Generate an access token
   * @param userId - User ID
   * @param role - User role (e.g., Admin, Seller)
   * @param mobileNo - User mobile number
   * @returns A JWT token as a string
   */
  static generateAccessToken(
    userId: string,
    role: string,
    mobileNo: string
  ): string {
    const payload = { userId, role, mobileNo }
    return jwt.sign(payload, config.jwtSecret as string) // Token expires in 1 hour
  }
  static async sendOtp(mobileNo: string, otp: string) {
    try {
      const smsResponse = await axios.get(
        `https://bulksmsbd.net/api/smsapi?api_key=hsYr6qwobYaKBZdh8xXJ&type=text&number=${mobileNo}&senderid=8809617623563&message=Otp:${otp}`
      )
      console.log(smsResponse.data)
      return smsResponse.data
    } catch (error) {
      throw error
    }
  }
  static async sendSms(mobileNo: string, message: string) {
    try {
      const smsResponse = await axios.get(
        `https://bulksmsbd.net/api/smsapi?api_key=hsYr6qwobYaKBZdh8xXJ&type=text&number=${mobileNo}&senderid=8809617623563&message=Password:${message}`
      )
      console.log(smsResponse.data)
      return smsResponse.data
    } catch (error) {
      throw error
    }
  }
}

export default Utility
