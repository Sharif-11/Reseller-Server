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
exports.CommissionService = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma_1 = __importDefault(require("../utils/prisma"));
class CommissionService {
    static validateCommissionRanges(data) {
        // Check all amounts arrays have same length
        const levelCount = new Set(data.map(item => item.amounts.length));
        if (levelCount.size > 1) {
            throw new ApiError_1.default(400, 'সমস্ত কমিশন লেভেলে একই সংখ্যক অ্যামাউন্ট থাকতে হবে');
        }
        // Check for non-positive values
        for (const row of data) {
            if (row.startPrice <= 0) {
                throw new ApiError_1.default(400, `শুরুর মূল্য অবশ্যই ধনাত্মক হতে হবে (পাওয়া গেছে ${row.startPrice})`);
            }
            if (row.endPrice && row.endPrice <= 0) {
                throw new ApiError_1.default(400, `শেষ মূল্য অবশ্যই ধনাত্মক হতে হবে (পাওয়া গেছে ${row.endPrice})`);
            }
            for (const amount of row.amounts) {
                if (amount <= 0) {
                    throw new ApiError_1.default(400, `কমিশনের পরিমাণ অবশ্যই ধনাত্মক হতে হবে (পাওয়া গেছে ${amount})`);
                }
            }
        }
        // Check for overlapping ranges
        const sortedRanges = [...data].sort((a, b) => a.startPrice - b.startPrice);
        for (let i = 0; i < sortedRanges.length - 1; i++) {
            const current = sortedRanges[i];
            const next = sortedRanges[i + 1];
            if (current.endPrice >= next.startPrice) {
                throw new ApiError_1.default(400, `রেঞ্জ ওভারল্যাপ ডিটেক্টেড: ${current.startPrice}-${current.endPrice} ওভারল্যাপ করছে ${next.startPrice}-${next.endPrice} এর সাথে`);
            }
        }
    }
    static transformToDatabaseFormat(data) {
        return data.flatMap(row => row.amounts.map((commission, index) => ({
            startPrice: new client_1.Prisma.Decimal(row.startPrice),
            endPrice: row.endPrice ? new client_1.Prisma.Decimal(row.endPrice) : null,
            level: index + 1,
            commission: new client_1.Prisma.Decimal(commission),
        })));
    }
    replaceCommissionTable(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate input data
            CommissionService.validateCommissionRanges(data);
            // Transform to database format
            const commissionEntries = CommissionService.transformToDatabaseFormat(data);
            // Transaction for atomic replacement
            return yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Clear existing data
                yield tx.commission.deleteMany();
                // Insert new data
                yield tx.commission.createMany({
                    data: commissionEntries,
                });
                // Return the newly created data in the original format
                return this.formatCommissionTable(yield tx.commission.findMany({
                    orderBy: [{ startPrice: 'asc' }, { level: 'asc' }],
                }));
            }));
        });
    }
    formatCommissionTable(commissions) {
        var _a, _b;
        const grouped = new Map();
        for (const commission of commissions) {
            const key = `${commission.startPrice}-${commission.endPrice}`;
            if (!grouped.has(key)) {
                grouped.set(key, {
                    startPrice: commission.startPrice.toNumber(),
                    endPrice: (_b = (_a = commission.endPrice) === null || _a === void 0 ? void 0 : _a.toNumber()) !== null && _b !== void 0 ? _b : null,
                    amounts: [],
                });
            }
            const group = grouped.get(key);
            group.amounts[commission.level - 1] = commission.commission.toNumber();
        }
        return Array.from(grouped.values()).sort((a, b) => a.startPrice - b.startPrice);
    }
    getCommissionTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const commissions = yield prisma_1.default.commission.findMany({
                orderBy: [{ startPrice: 'asc' }, { level: 'asc' }],
            });
            return this.formatCommissionTable(commissions);
        });
    }
    getCommissionsByPrice(price) {
        return __awaiter(this, void 0, void 0, function* () {
            if (price <= 0) {
                throw new ApiError_1.default(400, 'মূল্য অবশ্যই ধনাত্মক হতে হবে');
            }
            const commissions = yield prisma_1.default.commission.findMany({
                where: {
                    startPrice: { lte: price },
                    OR: [
                        { endPrice: { gte: price } },
                        { endPrice: null }, // For open-ended ranges (e.g., 1500+)
                    ],
                },
                orderBy: { level: 'asc' },
            });
            if (commissions.length === 0) {
                throw new ApiError_1.default(404, `${price} টাকার জন্য কোনো কমিশন পাওয়া যায়নি`);
            }
            return commissions.map(c => ({
                level: c.level,
                commission: c.commission.toNumber(),
            }));
        });
    }
    calculateUserCommissions(userPhone, price) {
        return __awaiter(this, void 0, void 0, function* () {
            if (price <= 0) {
                throw new ApiError_1.default(400, 'মূল্য অবশ্যই ধনাত্মক হতে হবে');
            }
            const [commissions, parentTree] = yield Promise.all([
                this.getCommissionsByPrice(price),
                this.getUserParentTree(userPhone),
            ]);
            return parentTree.map(parent => {
                var _a;
                return ({
                    phoneNo: parent.phoneNo,
                    name: parent.name,
                    level: parent.level,
                    commissionAmount: ((_a = commissions.find(c => c.level === parent.level)) === null || _a === void 0 ? void 0 : _a.commission) || 0,
                });
            });
        });
    }
    getUserParentTree(userPhone) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.$queryRaw `
      WITH RECURSIVE parent_tree AS (
        SELECT 
          "phoneNo", 
          "name", 
          0 AS "level", 
          "referredByPhone"
        FROM "users"
        WHERE "phoneNo" = ${userPhone}
        
        UNION ALL
        
        SELECT 
          u."phoneNo", 
          u."name", 
          pt."level" + 1 AS "level", 
          u."referredByPhone"
        FROM "users" u
        JOIN parent_tree pt ON u."phoneNo" = pt."referredByPhone"
      )
      SELECT 
        "phoneNo", 
        "name", 
        "level"
      FROM parent_tree
      WHERE "phoneNo" != ${userPhone}
      ORDER BY "level"
    `;
        });
    }
}
exports.CommissionService = CommissionService;
exports.default = new CommissionService();
