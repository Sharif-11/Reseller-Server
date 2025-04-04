import Decimal from 'decimal.js'
import config from '../config'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import SmsServices from './sms.services'
import transactionServices from './transaction.services'
import { calculateWithdrawal } from '../utils/withdraw.utils'
import { WalletName } from '../types/withdraw.types'

class WithdrawRequestServices {
  /**
   * Create a new withdraw request
   * @param {Object} data - The withdraw request data
   * @param {string} data.userId - User ID of the requester
   * @param {string} data.userPhoneNo - User's phone number
   * @param {string} data.userName - User's name
   * @param {number} data.amount - Withdrawal amount
   * @param {string} data.walletName - Wallet name
   * @param {string} data.walletPhoneNo - Wallet phone number
   * @param {string} [data.remarks] - Optional remarks
   * @returns {Object} - The created withdraw request
   */
  async createRequest({
    userId,
    userPhoneNo,
    userName,
    amount,
    walletName,
    walletPhoneNo,
    remarks,
  }: {
    userId: string
    userPhoneNo: string
    userName: string
    amount: number
    walletName: WalletName
    walletPhoneNo: string
    remarks?: string
  }) {
    const decimalAmount = new Decimal(amount)
    if (decimalAmount.isNaN() || decimalAmount.isNegative()) {
      throw new ApiError(400, 'Invalid amount.')
    }
    if (decimalAmount.isZero()) {
      throw new ApiError(400, 'Amount cannot be zero.')
    }
    // check if the amount exceed maximum limit
    if (decimalAmount.greaterThan(config.maximumWithdrawAmount)) {
      throw new ApiError(400, 'Amount exceeds the maximum limit.')
    }
    // check if the provide wallet name and wallet phone number is a valid one
    const wallet = await prisma.wallet.findFirst({
      where: {
        walletName,
        walletPhoneNo,
        userId,
      },
    })
    if (!wallet) {
      throw new ApiError(404, 'Wallet not found.')
    }
    // check if the user has enough balance
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { balance: true },
    })
    if (!user) {
      throw new ApiError(404, 'User not found.')
    }
    if (decimalAmount.greaterThan(user.balance)) {
      throw new ApiError(400, 'Insufficient balance.')
    }
    // Check if the user already has a pending request
    const existingRequest = await prisma.withdrawRequest.findFirst({
      where: {
        userId,
        status: 'pending',
      },
    })

    if (existingRequest) {
      throw new ApiError(400, 'You already have a pending withdrawal request.')
    }
    const {actualAmount, transactionFee} = calculateWithdrawal({
      walletName,
      walletPhoneNo,
      amount: decimalAmount.toNumber(),
    })
    // Create a new request
    const newRequest = await prisma.withdrawRequest.create({
      data: {
        userId,
        userPhoneNo,
        userName,
        amount: decimalAmount.toNumber(),
        walletName,
        walletPhoneNo,
        remarks,
        actualAmount,
        transactionFee,
      },
    })

    return newRequest
  }

  /**
   * Get all withdraw requests of a user with optional pagination
   * @param {string} userId - User ID
   * @param {string} [status] - Optional filter by status
   * @param {number} [page=1] - Page number for pagination
   * @param {number} [pageSize=10] - Number of items per page
   * @returns {Object} - List of withdraw requests with pagination info
   */
  async getUserRequests({
    userId,
    status,
    page = 1,
    pageSize = 10,
  }: {
    userId: string
    status?: 'pending' | 'completed' | 'rejected'
    page?: number
    pageSize?: number
  }) {
    const skip = (page - 1) * pageSize

    const filter = {
      userId,
    }

    const [requests, totalRequests] = await Promise.all([
      prisma.withdrawRequest.findMany({
        where: {
          userId,
          status: {
            in: status ? [status] : ['pending', 'completed', 'rejected'],
          },
        },
        orderBy: {
          requestedAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.withdrawRequest.count({
        where: filter,
      }),
    ])

    return {
      requests,
      totalRequests,
      currentPage: page,
      totalPages: Math.ceil(totalRequests / pageSize),
    }
  }

  /**
   * Cancel a withdraw request
   * @param {string} withdrawId - Withdraw request ID
   * @param {string} userId - User ID
   * @returns {Object} - The deleted withdraw request
   */
  async cancelRequest(withdrawId: string) {
    const request = await prisma.withdrawRequest.findUnique({
      where: { withdrawId },
    })

    if (!request) {
      throw new ApiError(404, 'Withdrawal request not found.')
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Only pending requests can be canceled.')
    }

    const deletedRequest = await prisma.withdrawRequest.delete({
      where: { withdrawId },
    })

    return deletedRequest
  }
  // get all withdraw requests with optional pagination, filter by status, and sorted by most recent requests
  async getAllRequests({
    status,
    page = 1,
    pageSize = 10,
  }: {
    status?: 'pending' | 'completed' | 'rejected'
    page?: number
    pageSize?: number
  }) {
    const skip = (page - 1) * pageSize

    const [requests, totalRequests] = await Promise.all([
      prisma.withdrawRequest.findMany({
        where: {
          status: {
            in: status ? [status] : ['pending', 'completed', 'rejected'],
          },
        },
        orderBy: {
          requestedAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.withdrawRequest.count({
        where: {
          status: {
            in: status ? [status] : ['pending', 'completed', 'rejected'],
          },
        },
      }),
    ])

    return {
      requests,
      totalRequests,
      currentPage: page,
      totalPages: Math.ceil(totalRequests / pageSize),
    }
  }
  // method to reject a withdraw request
  async rejectRequest(withdrawId: string, remarks: string) {
    const request = await prisma.withdrawRequest.findUnique({
      where: { withdrawId },
    })

    if (!request) {
      throw new ApiError(404, 'Withdrawal request not found.')
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Only pending requests can be rejected.')
    }

    const rejectedRequest = await prisma.withdrawRequest.update({
      where: { withdrawId },
      data: {
        status: 'rejected',
        remarks,
        processedAt: new Date(),
      },
    })

    return rejectedRequest
  }
  // method to complete a withdraw request
  async completeRequest({
    withdrawId,
    remarks,
    transactionId,
    transactionPhoneNo,
    userPhoneNo,
  }: {
    withdrawId: string
    remarks: string
    transactionId: string
    transactionPhoneNo: string
    userPhoneNo: string
  }) {
    const request = await prisma.withdrawRequest.findUnique({
      where: { withdrawId },
    })

    if (!request) {
      throw new ApiError(404, 'Withdrawal request not found.')
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Only pending requests can be completed.')
    }
    try {
      const completedRequest = await prisma.$transaction(
        async tx => {
          try {
            const updatedRequest = await tx.withdrawRequest.update({
              where: { withdrawId },
              data: {
                status: 'completed',
                remarks,
                transactionId,
                processedAt: new Date(),
              },
            })

            const transaction = await transactionServices.withdrawBalance({
              tx,
              amount: new Decimal(request.amount).toNumber(),
              userId: request.userId,
              remarks,
              paymentMethod: request.walletName,
              transactionId,
              paymentPhoneNo: transactionPhoneNo,
            })

            return { updatedRequest, transaction }
          } catch (error) {
            console.error('Error during transaction:', error)
            throw error
          }
        },
        { timeout: 5000 } // Set timeout to 10 seconds (10000 ms)
      )
      if (completedRequest) {
        try {
          await SmsServices.sendMessage(
            userPhoneNo,
            `${new Decimal(request.amount)
              .toNumber()
              .toFixed(2)} টাকা সফলভাবে আপনার ${request.walletName}(${
              request.walletPhoneNo
            }) অ্যাকাউন্টে প্রেরণ করা হয়েছে। প্রেরক: ${transactionPhoneNo}। tnxId: ${transactionId}`
          )
        } catch (error) {
          throw new ApiError(500, 'এসএমএস পাঠানো যায়নি')
        }
        return completedRequest
      }
    } catch (error) {
      throw new ApiError(
        400,
        (error as any).message || 'Failed to complete the request.'
      )
    }
  }
}

export default new WithdrawRequestServices()
