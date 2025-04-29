import { HttpStatusCode } from 'axios'
import { NextFunction, Request, Response } from 'express'
import paymentServices from '../services/payment.services'

class PaymentController {
  async createDuePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      const {
        amount,
        transactionId,
        adminWalletId,
        sellerWalletName,
        sellerWalletPhoneNo,
      } = req.body

      const newPayment = await paymentServices.createDuePaymentRequest({
        amount,
        transactionId: String(transactionId).trim(),
        sellerWalletName,
        sellerWalletPhoneNo,
        adminWalletId,
        sellerId: userId as string,
      })

      res.status(HttpStatusCode.Created).json({
        success: true,
        message: 'Payment request created successfully',
        data: newPayment,
      })
    } catch (error) {
      next(error)
    }
  }
  async verifyDuePaymentRequest(
    req: Request,

    res: Response,
    next: NextFunction
  ) {
    try {
      const { paymentId } = req.params
      const payment = await paymentServices.verifyDuePaymentRequest({
        paymentId: Number(paymentId),
        amount: req.body.amount,
        transactionId: req.body.transactionId,
      })
      res.status(HttpStatusCode.Accepted).json({
        statusCode: HttpStatusCode.Accepted,
        success: true,
        message: 'Payment request verified successfully',
        data: payment,
      })
    } catch (error) {
      next(error)
    }
  }
}
export default new PaymentController()
