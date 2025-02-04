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
class CommissionController {
    /**
     * Create commissions in the database
     */
    createCommissions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = req.body; // Input data should contain the array of commission objects
                const message = yield commission_services_1.default.createCommissions(data);
                res.status(201).json({
                    statusCode: 201,
                    message: 'Commissions created successfully.',
                    success: true,
                    data: message,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getCommissionsByPrice(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { price } = req.params; // Price should be passed as a route parameter
                const commissions = yield commission_services_1.default.getCommissionsByPrice(Number(price));
                res.status(200).json({
                    statusCode: 200,
                    message: `Commissions retrieved successfully for price: ${price}`,
                    success: true,
                    data: commissions,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getFullCommissionTable(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fullTable = yield commission_services_1.default.getFullCommissionTable();
                res.status(200).json({
                    statusCode: 200,
                    message: 'Full commission table retrieved successfully.',
                    success: true,
                    data: fullTable,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateCommissionTable(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = req.body; // Input should include the array of commission objects
                const updatedTable = yield commission_services_1.default.updateCommissionTable(data);
                res.status(200).json({
                    statusCode: 200,
                    message: 'Commissions table updated successfully.',
                    success: true,
                    data: updatedTable,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    calculateCommissions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { price, phoneNo } = req.body; // Price should be passed as a route parameter
                const commissions = yield commission_services_1.default.calculateCommissions(phoneNo, Number(price));
                res.status(200).json({
                    statusCode: 200,
                    message: 'Commissions calculated successfully.',
                    success: true,
                    data: commissions,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new CommissionController();
