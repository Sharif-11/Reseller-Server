import { Router } from 'express'
import orderControllers from '../controllers/order.controllers'

const sellerOrderRoutes = Router()
sellerOrderRoutes.get('/', orderControllers.getOrdersBySellerId)
sellerOrderRoutes.post(
  '/',
  // validateCreateOrder,
  // validateRequest,
  orderControllers.createOrder
)
sellerOrderRoutes.post('/verify-products', orderControllers.verifyOrderProducts)
sellerOrderRoutes.patch(
  '/:orderId/cancel-order',
  orderControllers.cancelOrderBySeller
)
sellerOrderRoutes.patch('/:orderId/re-order', orderControllers.reOrderFaulty)
export default sellerOrderRoutes
