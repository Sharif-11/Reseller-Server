import { NextFunction, Request, Response } from 'express'
import commissionServices from '../services/commission.services'

class CommissionController {
  /**
   * Create commissions in the database
   */
  async createCommissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { data } = req.body // Input data should contain the array of commission objects
      const message = await commissionServices.createCommissions(data)

      res.status(201).json({
        statusCode: 201,
        message: 'Commissions created successfully.',
        success: true,
        data: message,
      })
    } catch (error) {
      next(error)
    }
  }
  async getCommissionsByPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const { price } = req.params // Price should be passed as a route parameter
      const commissions = await commissionServices.getCommissionsByPrice(
        Number(price)
      )

      res.status(200).json({
        statusCode: 200,
        message: `Commissions retrieved successfully for price: ${price}`,
        success: true,
        data: commissions,
      })
    } catch (error) {
      next(error)
    }
  }
  async getFullCommissionTable(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fullTable = await commissionServices.getFullCommissionTable()

      res.status(200).json({
        statusCode: 200,
        message: 'Full commission table retrieved successfully.',
        success: true,
        data: fullTable,
      })
    } catch (error) {
      next(error)
    }
  }
  async updateCommissionTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { data } = req.body // Input should include the array of commission objects
      const updatedTable = await commissionServices.updateCommissionTable(data)

      res.status(200).json({
        statusCode: 200,
        message: 'Commissions table updated successfully.',
        success: true,
        data: updatedTable,
      })
    } catch (error) {
      next(error)
    }
  }
  async calculateCommissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { price, phoneNo } = req.body // Price should be passed as a route parameter
      const commissions = await commissionServices.calculateCommissions(
        phoneNo,
        Number(price)
      )

      res.status(200).json({
        statusCode: 200,
        message: 'Commissions calculated successfully.',
        success: true,
        data: commissions,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new CommissionController()
