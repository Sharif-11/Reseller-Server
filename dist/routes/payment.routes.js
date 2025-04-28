"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerPaymentRoutes = exports.adminPaymentRoutes = void 0;
const express_1 = require("express");
const payment_controllers_1 = __importDefault(require("../controllers/payment.controllers"));
const sellerPaymentRoutes = (0, express_1.Router)();
exports.sellerPaymentRoutes = sellerPaymentRoutes;
const adminPaymentRoutes = (0, express_1.Router)();
exports.adminPaymentRoutes = adminPaymentRoutes;
sellerPaymentRoutes.post('/due', payment_controllers_1.default.createDuePayment);
adminPaymentRoutes.post('/due/verify/:paymentId', payment_controllers_1.default.verifyDuePaymentRequest);
