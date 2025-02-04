"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaction_controller_1 = __importDefault(require("../controllers/transaction.controller"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const deposit_validators_1 = require("../Validators/deposit.validators");
const transactionRouters = express_1.default.Router();
// Add Deposit
transactionRouters.post('/deposit/:userId', deposit_validators_1.addDepositValidation, validation_middleware_1.default, transaction_controller_1.default.addDeposit);
// Withdraw Balance
transactionRouters.post('/withdraw-balance', transaction_controller_1.default.withdrawBalance);
exports.default = transactionRouters;
