import dotenv from 'dotenv'
import path from 'path'
dotenv.config({
  path: path.join(process.cwd(), '.env'),
})
export default {
  port: process.env.PORT || 3000,
  database_url: process.env.DATABASE_URL,
  saltRounds: process.env.SALT_ROUNDS || '10',
  jwtSecret: process.env.JWT_SECRET,
  otpLength: 6,
  otpExpiresIn: 2 * 60 * 1000, // 2 minutes
  apiKey: 'hsYr6qwobYaKBZdh8xXJ',
  senderId: '8809617623563',
  smsUrl: 'http://bulksmsbd.net/api/smsapi',
  maximumOtpAttempts: 2,
  nodeEnv: process.env.NODE_ENV || 'development',
  smsCharge: 0.75,
  maxForgotPasswordAttempts: 1,
  maximumWallets: 3,
  maximumWithdrawAmount: 10000,
  deliveryChargeInsideDhaka: 80,
  deliveryChargeOutsideDhaka: 130,
  negativeBalanceLimit: -10,
  minimumOrderCompletedToBeVerified: 1,
  forgotPasswordRequestInterval: 5 * 60 * 1000, // 5 minutes

  // cloudinaryKey: process.env.CLOUDINARY_KEY,
  // cloudinarySecret: process.env.CLOUDINARY_SECRET,
  // cloudinaryName: process.env.CLOUDINARY_NAME,
}
