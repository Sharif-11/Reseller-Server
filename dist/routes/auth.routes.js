"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = __importDefault(require("../controllers/auth.controllers"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const authRouter = (0, express_1.Router)();
authRouter.post('/send-otp', auth_controllers_1.default.sendOtp);
authRouter.post('/verify-otp', auth_controllers_1.default.verifyOtp);
authRouter.post('/login', auth_controllers_1.default.login);
authRouter.post('/logout', auth_controllers_1.default.logout);
authRouter.post('/create-admin', auth_controllers_1.default.createAdmin);
authRouter.post('/create-seller', auth_controllers_1.default.createSeller);
authRouter.patch('/change-password', auth_middlewares_1.isAuthenticated, auth_controllers_1.default.changePassword);
authRouter.patch('/update-profile', auth_middlewares_1.isAuthenticated, auth_controllers_1.default.updateProfile);
authRouter.post('/forgot-password', auth_controllers_1.default.forgotPassword);
exports.default = authRouter;
