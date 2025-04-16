import { Router } from "express";
import orderControllers from "../controllers/order.controllers";

const adminOrdersRoutes = Router();
adminOrdersRoutes.patch(
  "/approve/:orderId",orderControllers.approveOrder)
adminOrdersRoutes.patch(
  "/cancel/:orderId",orderControllers.cancelOrderByAdmin)
adminOrdersRoutes.patch(
  "/process/:orderId",orderControllers.processOrder)
adminOrdersRoutes.patch('/ship/:orderId',orderControllers.shipOrder)
adminOrdersRoutes.patch('/complete/:orderId',orderControllers.completeOrder)
adminOrdersRoutes.patch('/reject/:orderId',orderControllers.rejectOrder)
adminOrdersRoutes.patch('/return/:orderId',orderControllers.returnOrder)
export default adminOrdersRoutes;