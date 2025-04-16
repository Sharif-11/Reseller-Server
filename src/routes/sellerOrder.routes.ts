import { Router } from "express";
import orderControllers from "../controllers/order.controllers";

const sellerOrderRoutes=Router();
sellerOrderRoutes.post('/',orderControllers.createOrder)
sellerOrderRoutes.patch('/:orderId',orderControllers.cancelOrderBySeller)
export default sellerOrderRoutes