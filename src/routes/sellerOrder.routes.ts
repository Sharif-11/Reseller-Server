import { Router } from "express";
import orderControllers from "../controllers/order.controllers";

const sellerOrderRoutes=Router();
sellerOrderRoutes.post('/',orderControllers.createOrder)
export default sellerOrderRoutes