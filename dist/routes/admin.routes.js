"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = __importDefault(require("../controllers/auth.controllers"));
const transaction_controller_1 = __importDefault(require("../controllers/transaction.controller"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const adminOrders_routes_1 = __importDefault(require("./adminOrders.routes"));
const adminProduct_routes_1 = __importDefault(require("./adminProduct.routes"));
const adminWallet_routes_1 = __importDefault(require("./adminWallet.routes"));
const adminWithdraw_routes_1 = __importDefault(require("./adminWithdraw.routes"));
const commissions_routes_1 = __importDefault(require("./commissions.routes"));
const payment_routes_1 = require("./payment.routes");
// import transactionRouters from './transaction.routes'
const adminRouter = (0, express_1.Router)();
adminRouter.use(auth_middlewares_1.isAuthenticated, auth_middlewares_1.verifyAdmin);
adminRouter.use('/products', adminProduct_routes_1.default);
// adminRouter.use('/transactions', transactionRouters)
adminRouter.use('/withdraw', adminWithdraw_routes_1.default);
adminRouter.use('/orders', adminOrders_routes_1.default);
adminRouter.use('/wallets', adminWallet_routes_1.default);
adminRouter.get('/transactions', transaction_controller_1.default.getAllTransactionForAdmin);
adminRouter.use('/commissions', commissions_routes_1.default);
adminRouter.use('/payments', payment_routes_1.adminPaymentRoutes);
adminRouter.patch('/unlock-user', auth_controllers_1.default.unlockUser);
exports.default = adminRouter;
