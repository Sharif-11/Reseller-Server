"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = __importDefault(require("../controllers/auth.controllers"));
const commission_controller_1 = __importDefault(require("../controllers/commission.controller"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const adminProduct_routes_1 = __importDefault(require("./adminProduct.routes"));
const adminWithdraw_routes_1 = __importDefault(require("./adminWithdraw.routes"));
// import transactionRouters from './transaction.routes'
const adminRouter = (0, express_1.Router)();
adminRouter.use(auth_middlewares_1.isAuthenticated, auth_middlewares_1.verifyAdmin);
adminRouter.use('/products', adminProduct_routes_1.default);
// adminRouter.use('/transactions', transactionRouters)
adminRouter.use('/withdraw', adminWithdraw_routes_1.default);
adminRouter.post('/commissions', commission_controller_1.default.createCommissions);
adminRouter.get('/commissions', commission_controller_1.default.getFullCommissionTable);
adminRouter.put('/commissions', commission_controller_1.default.updateCommissionTable);
adminRouter.get('/calculate-commissions', commission_controller_1.default.calculateCommissions);
adminRouter.get('/commissions/:price', commission_controller_1.default.getCommissionsByPrice);
adminRouter.patch('/unlock-user', auth_controllers_1.default.unlockUser);
exports.default = adminRouter;
