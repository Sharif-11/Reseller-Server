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
sellerOrderRoutes.patch(
  '/:orderId/cancel-order',
  orderControllers.cancelOrderBySeller
)
sellerOrderRoutes.patch('/:orderId/re-order', orderControllers.reOrderFaulty)
export default sellerOrderRoutes
