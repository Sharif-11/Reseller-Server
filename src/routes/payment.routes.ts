import { Router } from 'express'
import paymentControllers from '../controllers/payment.controllers'

const sellerPaymentRoutes = Router()
const adminPaymentRoutes = Router()
sellerPaymentRoutes.post('/due', paymentControllers.createDuePayment)
adminPaymentRoutes.post(
  '/due/verify/:paymentId',
  paymentControllers.verifyDuePaymentRequest
)
export { adminPaymentRoutes, sellerPaymentRoutes }
