"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walletOTP_controllers_1 = __importDefault(require("../controllers/walletOTP.controllers"));
const wallets_controllers_1 = __importDefault(require("../controllers/wallets.controllers"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const auth_validators_1 = require("../Validators/auth.validators");
const walletRouter = (0, express_1.Router)();
// Route to add a new wallet
walletRouter.post('/', wallets_controllers_1.default.addWallet);
// Route to get all wallets of a specific user
walletRouter.get('/', wallets_controllers_1.default.getWallets);
walletRouter.get('/admin-wallets', wallets_controllers_1.default.getAdminWalletsForUser);
walletRouter.post('/send-otp', auth_validators_1.validateSendOtp, validation_middleware_1.default, walletOTP_controllers_1.default.sendOtp);
walletRouter.post('/verify-otp', auth_validators_1.validateVerifyOtp, validation_middleware_1.default, walletOTP_controllers_1.default.verifyOtp);
exports.default = walletRouter;
