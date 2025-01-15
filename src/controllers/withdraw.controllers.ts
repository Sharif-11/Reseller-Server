import { NextFunction, Request, Response } from 'express'
import withdrawServices from '../services/withdraw.services'
import prisma from '../utils/prisma'

class WithdrawRequestController {
  /**
   * Create a new withdraw request
   */
  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId as string
      const userPhoneNo = req.user?.mobileNo as string
      const user = await prisma.user.findUnique({
        where: { userId },
      })
      const { amount, walletName, walletPhoneNo } = req.body
      console.log({
        amount,
        walletName,
        walletPhoneNo,
        user: { userId, userPhoneNo, name: user?.name },
      })
      const newRequest = await withdrawServices.createRequest({
        userId,
        userPhoneNo,
        userName: user?.name as string,
        amount,
        walletName,
        walletPhoneNo,
      })

      res.status(201).json({
        statusCode: 201,
        success: true,
        message: 'Withdrawal request created successfully.',
        data: newRequest,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get all withdrawal requests for a user with optional pagination and filtering by status
   */
  async getUserRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId as string
      const { status, page, pageSize } = req.query as {
        status?: 'pending' | 'completed' | 'rejected'
        page?: string
        pageSize?: string
      }

      const requests = await withdrawServices.getUserRequests({
        userId,
        status,
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
      })

      res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'Withdrawal requests retrieved successfully.',
        data: requests,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Cancel a withdrawal request
   */
  async cancelRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { withdrawId } = req.params

      const canceledRequest = await withdrawServices.cancelRequest(withdrawId)

      res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'Withdrawal request canceled successfully.',
        data: canceledRequest,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get all withdrawal requests with optional pagination and filtering by status
   */
  async getAllRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, pageSize } = req.query as {
        status?: 'pending' | 'completed' | 'rejected'
        page?: string
        pageSize?: string
      }

      const requests = await withdrawServices.getAllRequests({
        status: status as 'pending' | 'completed' | 'rejected',
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
      })

      res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'All withdrawal requests retrieved successfully.',
        data: requests,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Reject a withdrawal request
   */
  async rejectRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { withdrawId } = req.params
      const { remarks } = req.body

      const rejectedRequest = await withdrawServices.rejectRequest(
        withdrawId,
        remarks
      )

      res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'Withdrawal request rejected successfully.',
        data: rejectedRequest,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Complete a withdrawal request
   */
  async completeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { withdrawId } = req.params
      const { remarks, transactionId, transactionPhoneNo } = req.body

      const completedRequest = await withdrawServices.completeRequest({
        withdrawId,
        remarks,
        transactionId,
        transactionPhoneNo,
      })

      res.status(200).json({
        success: true,
        message: 'Withdrawal request completed successfully.',
        data: completedRequest,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new WithdrawRequestController()
