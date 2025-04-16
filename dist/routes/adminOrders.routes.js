"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controllers_1 = __importDefault(require("../controllers/order.controllers"));
const adminOrdersRoutes = (0, express_1.Router)();
adminOrdersRoutes.patch("/approve/:orderId", order_controllers_1.default.approveOrder);
adminOrdersRoutes.patch("/cancel/:orderId", order_controllers_1.default.cancelOrderByAdmin);
adminOrdersRoutes.patch("/process/:orderId", order_controllers_1.default.processOrder);
adminOrdersRoutes.patch('/ship/:orderId', order_controllers_1.default.shipOrder);
adminOrdersRoutes.patch('/complete/:orderId', order_controllers_1.default.completeOrder);
adminOrdersRoutes.patch('/reject/:orderId', order_controllers_1.default.rejectOrder);
adminOrdersRoutes.patch('/return/:orderId', order_controllers_1.default.returnOrder);
exports.default = adminOrdersRoutes;
