import axios from 'axios'
import config from '../config'
import ApiError, { SmsServiceError } from '../utils/ApiError'

type SmsResponse = {
  response_code: number
  message_id?: number
  success_message?: string
  error_message?: string
}
class SmsServices {
  private static readonly API_KEY = config.apiKey
  private static readonly SENDER_ID = config.senderId
  private static readonly BASE_URL = config.smsUrl
  private static responseMessages: { [key: number]: string } = {
    202: 'SMS Submitted Successfully',
    1001: 'Invalid Number',
    1002: 'Sender ID not correct or disabled',
    1003: 'Required fields missing or contact system administrator',
    1005: 'Internal Error',
    1006: 'Balance validity not available',
    1007: 'Insufficient balance',
    1011: 'User ID not found',
    1012: 'Masking SMS must be sent in Bengali',
    1013: 'Sender ID not found by API key',
    1014: 'Sender type name not found using this sender by API key',
    1015: 'Sender ID has no valid gateway by API key',
    1016: 'Sender type name active price info not found by this sender ID',
    1017: 'Sender type name price info not found by this sender ID',
    1018: 'Account owner is disabled',
    1019: 'Sender type name price for this account is disabled',
    1020: 'Parent account not found',
    1021: 'Parent active sender type price for this account is not found',
    1031: 'Account not verified, please contact administrator',
    1032: 'IP not whitelisted',
  }
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
          message: `আপনার ওটিপি কোডটি হলো: ${otp}। এই কোডটি অনুগ্রহ করে কাউকে জানাবেন না।`,
        },
      })
      console.log('OTP SMS Response:', response.data)
      return this.handleSmsResponse(response.data)
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
          message: `আপনার পাসওয়ার্ডটি হলো: ${password}। এই পাসওয়ার্ডটি অনুগ্রহ করে কাউকে জানাবেন না।`,
        },
      })

      return this.handleSmsResponse(response.data)
    } catch (error) {
      throw new Error('Failed to send Password via SMS')
    }
  }
  // A generic method to send any message via SMS
  static async sendMessage(mobileNo: string, message: string) {
    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          api_key: this.API_KEY,
          type: 'text',
          number: mobileNo,
          senderid: this.SENDER_ID,
          message,
        },
      })

      return this.handleSmsResponse(response.data)
    } catch (error) {
      console.error('Error sending Message SMS:', error)
      throw new ApiError(400, 'Failed to send Message via SMS')
    }
  }
  static handleSmsResponse(response: SmsResponse): string {
    const { response_code, success_message, error_message } = response

    const message = this.responseMessages[response_code] || 'Unknown error code'

    if (response_code === 202) {
      return success_message || message
    } else {
      throw new SmsServiceError(400, error_message || message)
    }
  }
}

export default SmsServices
