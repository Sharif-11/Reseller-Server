"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controllers_1 = __importDefault(require("../controllers/order.controllers"));
const adminOrdersRoutes = (0, express_1.Router)();
adminOrdersRoutes.get('/', order_controllers_1.default.getOrdersForAdmin);
adminOrdersRoutes.patch('/:orderId/cancel', order_controllers_1.default.cancelOrderByAdmin);
adminOrdersRoutes.patch('/:orderId/process', order_controllers_1.default.processOrder);
adminOrdersRoutes.patch('/:orderId/ship', order_controllers_1.default.shipOrder);
adminOrdersRoutes.patch('/:orderId/complete', order_controllers_1.default.completeOrder);
adminOrdersRoutes.patch('/:orderId/return', order_controllers_1.default.returnOrder);
adminOrdersRoutes.patch('/:orderId/faulty', order_controllers_1.default.faultyOrderByAdmin);
exports.default = adminOrdersRoutes;
