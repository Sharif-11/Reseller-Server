import { Router } from 'express'
import orderControllers from '../controllers/order.controllers'

const adminOrdersRoutes = Router()
adminOrdersRoutes.get('/', orderControllers.getOrdersForAdmin)
adminOrdersRoutes.patch('/:orderId/cancel', orderControllers.cancelOrderByAdmin)
adminOrdersRoutes.patch('/:orderId/process', orderControllers.processOrder)
adminOrdersRoutes.patch('/:orderId/ship', orderControllers.shipOrder)
adminOrdersRoutes.patch('/:orderId/complete', orderControllers.completeOrder)
adminOrdersRoutes.patch('/:orderId/return', orderControllers.returnOrder)
adminOrdersRoutes.patch('/:orderId/faulty', orderControllers.faultyOrderByAdmin)

export default adminOrdersRoutes
