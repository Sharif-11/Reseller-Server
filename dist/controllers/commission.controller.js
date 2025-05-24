"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commission_services_1 = __importDefault(require("../services/commission.services"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
class CommissionController {
    /**
     * Completely replace the commission table (PUT semantics)
     */
    replaceCommissionTable(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = req.body;
                if (!Array.isArray(data)) {
                    throw new ApiError_1.default(400, 'অনুগ্রহ করে একটি বৈধ ডেটা অ্যারে প্রদান করুন');
                }
                const updatedTable = yield commission_services_1.default.replaceCommissionTable(data);
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'কমিশন টেবিল সফলভাবে আপডেট করা হয়েছে',
                    data: updatedTable,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Get the complete commission table
     */
    getCommissionTable(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const commissionTable = yield commission_services_1.default.getCommissionTable();
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'কমিশন টেবিল সফলভাবে retrieved করা হয়েছে',
                    data: commissionTable,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Get commissions for a specific price point
     */
    getCommissionsForPrice(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const price = parseFloat(req.params.price);
                if (isNaN(price)) {
                    throw new ApiError_1.default(400, 'অবৈধ মূল্য পরামিতি');
                }
                const commissions = yield commission_services_1.default.getCommissionsByPrice(price);
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: `${price} টাকার জন্য কমিশন সফলভাবে retrieved করা হয়েছে`,
                    data: commissions,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Calculate commissions for a user's purchase
     */
    calculateUserCommissions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNo, price } = req.body;
                if (!phoneNo || !price) {
                    throw new ApiError_1.default(400, 'ফোন নম্বর এবং মূল্য উভয়ই প্রয়োজন');
                }
                const numericPrice = parseFloat(price);
                if (isNaN(numericPrice)) {
                    throw new ApiError_1.default(400, 'মূল্য একটি বৈধ সংখ্যা হতে হবে');
                }
                const commissionDistribution = yield commission_services_1.default.calculateUserCommissions(phoneNo, numericPrice);
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'কমিশন হিসাব সফলভাবে সম্পন্ন হয়েছে',
                    data: commissionDistribution,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new CommissionController();
