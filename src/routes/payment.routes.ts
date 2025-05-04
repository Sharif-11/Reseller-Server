import { Router } from 'express'
import paymentControllers from '../controllers/payment.controllers'

const sellerPaymentRoutes = Router()
const adminPaymentRoutes = Router()
sellerPaymentRoutes.get('/', paymentControllers.getAllPaymentsOfASeller)
sellerPaymentRoutes.post('/due', paymentControllers.createDuePayment)
adminPaymentRoutes.get('/', paymentControllers.getAllPaymentsForAdmin)
adminPaymentRoutes.patch(
  '/:paymentId/verify-due',
  paymentControllers.verifyDuePaymentRequest
)
adminPaymentRoutes.patch(
  '/:paymentId/verify-order',
  paymentControllers.verifyOrderPaymentRequest
)
adminPaymentRoutes.patch(
  '/:paymentId/reject-order',
  paymentControllers.rejectOrderPaymentRequest
)
adminPaymentRoutes.patch(
  '/:paymentId/reject',
  paymentControllers.rejectPaymentRequest
)
export { adminPaymentRoutes, sellerPaymentRoutes }
