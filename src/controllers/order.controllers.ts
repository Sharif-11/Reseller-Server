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

  /**
   * Approve an order by Admin
   */
  async approveOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = +req.params.orderId
      const transactionId = req.body.transactionId
      const order = await OrderServices.approveOrderByAdmin({
        orderId,transactionId
      })
      res.status(200).json({
        statusCode: 200,
        message: 'অর্ডার সফলভাবে অনুমোদিত হয়েছে',
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }

 
}

  /** 
   * Cancel an order by Admin
   */
  async cancelOrderByAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = +req.params.orderId
      const remarks= req.body.remarks
      const order = await OrderServices.cancelOrderByAdmin(orderId,remarks)
      res.status(200).json({
        statusCode: 200,
        message: 'অর্ডার সফলভাবে বাতিল করা হয়েছে এবং টাকা ফেরত দেওয়া হয়েছে',
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Cancel an order by Seller
   */
  async cancelOrderBySeller(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = +req.params.orderId
      const sellerId = req.user?.userId
      const order = await OrderServices.cancelOrderBySeller(orderId, sellerId!)
      res.status(200).json({
        statusCode: 200,
        message: 'অর্ডার সফলভাবে বাতিল হয়েছে',
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Reject an order by Admin
   */
  async rejectOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = +req.params.orderId
      const remarks= req.body.remarks
      const order = await OrderServices.rejectOrderByAdmin(orderId,remarks)
      res.status(200).json({
        statusCode: 200,
        message: 'অর্ডার সফলভাবে বাতিল হয়েছে',
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }
}
  async processOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = +req.params.orderId
      const order = await OrderServices.processOrderByAdmin(orderId)
      res.status(200).json({
        statusCode: 200,
        message: order.orderStatus==='processing' ? 'অর্ডার সফলভাবে প্রক্রিয়া করা হয়েছে' : 'বিক্রেতা ইতিমধ্যে এই অর্ডার বাতিল করেছেন বলে টাকা ফেরত দেওয়া হয়েছে',
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }
  }
  async shipOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = +req.params.orderId
      const {courierName,trackingURL}= req.body
      const order = await OrderServices.shipOrderByAdmin(orderId,courierName,trackingURL)
      res.status(200).json({
        statusCode: 200,
        message: 'অর্ডার সফলভাবে শিপ করা হয়েছে',
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }
  }
  async completeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = +req.params.orderId
      const {totalAmountPaidByCustomer}= req.body
      const order = await OrderServices.completeOrderByAdmin(orderId,totalAmountPaidByCustomer)
      res.status(200).json({
        statusCode: 200,
        message: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে',
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }
  }
  async returnOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = +req.params.orderId
      const order = await OrderServices.returnOrderByAdmin(orderId)
      res.status(200).json({
        statusCode: 200,
        message: 'অর্ডার সফলভাবে ফেরত দেওয়া হয়েছে',
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }
  }




}
export default new OrderController()