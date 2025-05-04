"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controllers_1 = __importDefault(require("../controllers/order.controllers"));
const sellerOrderRoutes = (0, express_1.Router)();
sellerOrderRoutes.get('/', order_controllers_1.default.getOrdersBySellerId);
sellerOrderRoutes.post('/', 
// validateCreateOrder,
// validateRequest,
order_controllers_1.default.createOrder);
sellerOrderRoutes.patch('/:orderId/cancel-order', order_controllers_1.default.cancelOrderBySeller);
sellerOrderRoutes.patch('/:orderId/re-order', order_controllers_1.default.reOrderFaulty);
exports.default = sellerOrderRoutes;
