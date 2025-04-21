import { Router } from "express";
import orderControllers from "../controllers/order.controllers";
import { validateCreateOrder } from "../Validators/order.validators";
import validateRequest from "../middlewares/validation.middleware";

const sellerOrderRoutes=Router();
sellerOrderRoutes.get('/',orderControllers.getOrdersBySellerId)
sellerOrderRoutes.post('/',validateCreateOrder,validateRequest,orderControllers.createOrder)
sellerOrderRoutes.patch('/:orderId',orderControllers.cancelOrderBySeller)
export default sellerOrderRoutes