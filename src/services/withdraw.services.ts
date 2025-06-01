import Decimal from 'decimal.js'
import config from '../config'
import { WalletName } from '../types/withdraw.types'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import { calculateWithdrawal } from '../utils/withdraw.utils'
import paymentServices from './payment.services'
import SmsServices from './sms.services'
import transactionServices from './transaction.services'
import userServices from './user.services'

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
      throw new ApiError(400, 'অবৈধ পরিমাণ।')
    }
    if (decimalAmount.isZero()) {
      throw new ApiError(400, 'পরিমাণ শূন্য হতে পারবে না।')
    }
    // check if the amount exceed maximum limit
    if (decimalAmount.greaterThan(config.maximumWithdrawAmount)) {
      throw new ApiError(400, 'পরিমাণ সর্বোচ্চ সীমা অতিক্রম করেছে।')
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
      throw new ApiError(404, 'ওয়ালেট পাওয়া যায়নি।')
    }
    // check if the user has enough balance
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { balance: true },
    })
    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি।')
    }
    if (decimalAmount.greaterThan(user.balance)) {
      throw new ApiError(400, 'পর্যাপ্ত ব্যালেন্স নেই।')
    }

    // Get the start of the current day
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Check if the user already has a pending request
    const existingPendingRequest = await prisma.withdrawRequest.findFirst({
      where: {
        userId,
        status: 'pending',
      },
    })

    if (existingPendingRequest) {
      throw new ApiError(400, 'আপনার একটি উত্তোলনের অনুরোধ বাকিতে রয়েছে।')
    }

    // Check if user has already made 2 requests today
    const todaysRequestsCount = await prisma.withdrawRequest.count({
      where: {
        userId,
        requestedAt: {
          gte: todayStart,
        },
      },
    })

    if (todaysRequestsCount >= 2) {
      throw new ApiError(
        400,
        'আপনি দিনে সর্বোচ্চ দুইবার উত্তোলনের অনুরোধ করতে পারবেন।'
      )
    }

    const { actualAmount, transactionFee } = calculateWithdrawal({
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

    // Notify admin about the new request
    try {
      const admin = await userServices.getAdminForTheUsers()
      await SmsServices.sendWithdrawalRequestToAdmin({
        mobileNo: admin!.phoneNo,
        sellerName: userName,
        sellerPhoneNo: userPhoneNo,
        amount: decimalAmount.toNumber(),
      })
    } catch (error) {
      console.error('এডমিনকে এসএমএস পাঠাতে ত্রুটি:', error)
      // Optionally, you can handle the error or log it
    }

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

    const filter: Record<string, string> = {
      userId,
    }
    if (status) {
      filter['status'] = status
    }
    const requests = prisma.withdrawRequest.findMany({
      where: filter,
      orderBy: {
        requestedAt: 'desc',
      },
      skip,
      take: pageSize,
    })
    const totalRequests = prisma.withdrawRequest.count({
      where: filter,
    })
    const [paginationRequest, overallRequests] = await Promise.all([
      requests,
      totalRequests,
    ])
    return {
      requests: paginationRequest,
      totalRequests: overallRequests,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(overallRequests / pageSize),
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
      pageSize,
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
    transactionPhoneNo?: string
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
            const withdrawPayment =
              await paymentServices.createWithdrawPaymentRequest({
                tx,
                withdrawId: updatedRequest.withdrawId,
                amount: updatedRequest.actualAmount.toNumber(),
                transactionId,
                sellerWalletName: updatedRequest.walletName,
                sellerWalletPhoneNo: updatedRequest.walletPhoneNo,
                sellerName: updatedRequest.userName,
                sellerPhoneNo: updatedRequest.userPhoneNo,
                adminWalletName: updatedRequest.walletName,
                adminWalletPhoneNo: String(transactionPhoneNo),
                sellerId: updatedRequest.userId,
                actualAmount: updatedRequest.actualAmount.toNumber(),
                transactionFee: updatedRequest.transactionFee.toNumber(),
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

            return { updatedRequest, transaction, withdrawPayment }
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
            completedRequest.updatedRequest.userPhoneNo,
            `${new Decimal(request.actualAmount)
              .toNumber()
              .toFixed(2)} টাকা সফলভাবে আপনার ${request.walletName}(${
              request.walletPhoneNo
            }) অ্যাকাউন্টে প্রেরণ করা হয়েছে, ট্রানজেকশন ফি: ${
              request.transactionFee
            } টাকা।`
          )
        } catch (error) {
          // throw new ApiError(500, 'এসএমএস পাঠানো যায়নি')
          console.error('Error sending SMS:', error)
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
