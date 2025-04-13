"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = __importDefault(require("../controllers/auth.controllers"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const adminProduct_routes_1 = __importDefault(require("./adminProduct.routes"));
const adminWithdraw_routes_1 = __importDefault(require("./adminWithdraw.routes"));
const transaction_controller_1 = __importDefault(require("../controllers/transaction.controller"));
const adminWallet_routes_1 = __importDefault(require("./adminWallet.routes"));
const commissions_routes_1 = __importDefault(require("./commissions.routes"));
// import transactionRouters from './transaction.routes'
const adminRouter = (0, express_1.Router)();
adminRouter.use(auth_middlewares_1.isAuthenticated, auth_middlewares_1.verifyAdmin);
adminRouter.use('/products', adminProduct_routes_1.default);
// adminRouter.use('/transactions', transactionRouters)
adminRouter.use('/withdraw', adminWithdraw_routes_1.default);
adminRouter.use('/wallets', adminWallet_routes_1.default);
adminRouter.get('/transactions', transaction_controller_1.default.getAllTransactionForAdmin);
adminRouter.use('/commissions', commissions_routes_1.default);
adminRouter.patch('/unlock-user', auth_controllers_1.default.unlockUser);
exports.default = adminRouter;
