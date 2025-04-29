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
sellerPaymentRoutes.get('/', payment_controllers_1.default.getAllPaymentsOfASeller);
sellerPaymentRoutes.post('/due', payment_controllers_1.default.createDuePayment);
adminPaymentRoutes.get('/', payment_controllers_1.default.getAllPaymentsForAdmin);
adminPaymentRoutes.patch('/:paymentId/verify-due', payment_controllers_1.default.verifyDuePaymentRequest);
adminPaymentRoutes.patch('/:paymentId/reject', payment_controllers_1.default.rejectPaymentRequest);
