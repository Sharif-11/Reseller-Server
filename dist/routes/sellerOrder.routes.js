"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controllers_1 = __importDefault(require("../controllers/order.controllers"));
const order_validators_1 = require("../Validators/order.validators");
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const sellerOrderRoutes = (0, express_1.Router)();
sellerOrderRoutes.get('/', order_controllers_1.default.getOrdersBySellerId);
sellerOrderRoutes.post('/', order_validators_1.validateCreateOrder, validation_middleware_1.default, order_controllers_1.default.createOrder);
sellerOrderRoutes.patch('/:orderId', order_controllers_1.default.cancelOrderBySeller);
exports.default = sellerOrderRoutes;
