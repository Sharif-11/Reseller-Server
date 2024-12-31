import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../config'
export class Utility {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, Number(config.saltRounds))
  }

  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

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
}

export default Utility
