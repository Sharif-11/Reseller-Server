"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const withdraw_controllers_1 = __importDefault(require("../controllers/withdraw.controllers"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const withdrawValidators_1 = __importDefault(require("../Validators/withdrawValidators"));
const sellerWithdrawRouter = (0, express_1.Router)();
sellerWithdrawRouter.post('/', withdrawValidators_1.default.createRequest, validation_middleware_1.default, withdraw_controllers_1.default.createRequest);
sellerWithdrawRouter.get('/', withdrawValidators_1.default.getUserRequests, validation_middleware_1.default, withdraw_controllers_1.default.getUserRequests);
sellerWithdrawRouter.delete('/:withdrawId', withdrawValidators_1.default.cancelRequest, validation_middleware_1.default, withdraw_controllers_1.default.cancelRequest);
exports.default = sellerWithdrawRouter;
