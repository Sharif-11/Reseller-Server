"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallets_controllers_1 = __importDefault(require("../controllers/wallets.controllers"));
const adminWalletRouter = (0, express_1.Router)();
adminWalletRouter.post('/', wallets_controllers_1.default.addAdminWallet);
adminWalletRouter.get('/', wallets_controllers_1.default.getWallets);
adminWalletRouter.delete('/:walletId', wallets_controllers_1.default.deleteAdminWallet);
exports.default = adminWalletRouter;
