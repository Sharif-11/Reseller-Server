import { NextFunction, Request, Response } from 'express'
import OrderServices from '../services/order.services'
import ApiError from '../utils/ApiError'

class OrderController {
  /**
   * Create a new order
   */
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user?.userId
      const order = await OrderServices.createOrder(req.body, sellerId!)
      
      res.status(201).json({
        statusCode: 201,
        message: 'অর্ডার সফলভাবে তৈরি করা হয়েছে',
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }
  }

 
}

export default new OrderController()