import { NextFunction, Request, Response } from 'express'
import commissionService from '../services/commission.services'
import ApiError from '../utils/ApiError'

class CommissionController {
  /**
   * Completely replace the commission table (PUT semantics)
   */
  async replaceCommissionTable(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { data } = req.body

      if (!Array.isArray(data)) {
        throw new ApiError(400, 'অনুগ্রহ করে একটি বৈধ ডেটা অ্যারে প্রদান করুন')
      }

      const updatedTable = await commissionService.replaceCommissionTable(data)

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'কমিশন টেবিল সফলভাবে আপডেট করা হয়েছে',
        data: updatedTable,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get the complete commission table
   */
  async getCommissionTable(req: Request, res: Response, next: NextFunction) {
    try {
      const commissionTable = await commissionService.getCommissionTable()

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'কমিশন টেবিল সফলভাবে retrieved করা হয়েছে',
        data: commissionTable,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get commissions for a specific price point
   */
  async getCommissionsForPrice(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const price = parseFloat(req.params.price)

      if (isNaN(price)) {
        throw new ApiError(400, 'অবৈধ মূল্য পরামিতি')
      }

      const commissions = await commissionService.getCommissionsByPrice(price)

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `${price} টাকার জন্য কমিশন সফলভাবে retrieved করা হয়েছে`,
        data: commissions,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Calculate commissions for a user's purchase
   */
}

export default new CommissionController()
