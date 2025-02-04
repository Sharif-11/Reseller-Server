"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const withdraw_controllers_1 = __importDefault(require("../controllers/withdraw.controllers"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const withdrawValidators_1 = __importDefault(require("../Validators/withdrawValidators"));
const adminWithdrawRouter = (0, express_1.Router)();
adminWithdrawRouter.get('/', withdrawValidators_1.default.getAllRequests, validation_middleware_1.default, withdraw_controllers_1.default.getAllRequests);
adminWithdrawRouter.patch('/:withdrawId/complete', withdrawValidators_1.default.completeRequest, validation_middleware_1.default, withdraw_controllers_1.default.completeRequest);
adminWithdrawRouter.patch('/:withdrawId/reject', withdrawValidators_1.default.rejectRequest, validation_middleware_1.default, withdraw_controllers_1.default.rejectRequest);
exports.default = adminWithdrawRouter;
