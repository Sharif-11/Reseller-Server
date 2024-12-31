import axios from 'axios'
import config from '../config'

class SmsServices {
  private static readonly API_KEY = config.apiKey
  private static readonly SENDER_ID = config.senderId
  private static readonly BASE_URL = config.smsUrl

  /**
   * Send OTP via SMS
   * @param mobileNo - The recipient's mobile number
   * @param otp - The OTP to be sent
   * @returns The response data from the SMS API
   */
  static async sendOtp(mobileNo: string, otp: string) {
    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          api_key: this.API_KEY,
          type: 'text',
          number: mobileNo,
          senderid: this.SENDER_ID,
          message: `Otp:${otp}`,
        },
      })
      console.log('OTP SMS Response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error sending OTP SMS:', error)
      throw new Error('Failed to send OTP via SMS')
    }
  }

  /**
   * Send password via SMS
   * @param mobileNo - The recipient's mobile number
   * @param password - The password to be sent
   * @returns The response data from the SMS API
   */
  static async sendPassword(mobileNo: string, password: string) {
    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          api_key: this.API_KEY,
          type: 'text',
          number: mobileNo,
          senderid: this.SENDER_ID,
          message: `Password:${password}`,
        },
      })
      console.log('Password SMS Response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error sending Password SMS:', error)
      throw new Error('Failed to send Password via SMS')
    }
  }
}

export default SmsServices
