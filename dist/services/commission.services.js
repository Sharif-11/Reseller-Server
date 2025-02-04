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
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma_1 = __importDefault(require("../utils/prisma"));
class CommissionService {
    constructor() {
        this.hasOverlappingRanges = (ranges) => {
            ranges.sort((a, b) => a.startPrice - b.startPrice);
            for (let i = 0; i < ranges.length - 1; i++) {
                if (ranges[i].endPrice >= ranges[i + 1].startPrice) {
                    return true;
                }
            }
            return false;
        };
        this.validateAmountsArray = (input) => {
            const validLengths = input.map(({ amounts }) => amounts.filter(amount => amount !== null).length);
            return validLengths.every(length => length === validLengths[0]);
        };
        this.createCommissionEntries = (data) => {
            const commissionEntries = data
                .map(({ startPrice, endPrice, amounts }) => amounts.map((commission, index) => ({
                startPrice,
                endPrice,
                level: index + 1,
                commission,
            })))
                .flat();
            return commissionEntries;
        };
    }
    createCommissions(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validation: Check if amounts arrays are consistent
            if (!this.validateAmountsArray(data)) {
                throw new Error('All amounts arrays must have the same length (excluding empty elements).');
            }
            // Validation: Check for overlapping ranges
            if (this.hasOverlappingRanges(data)) {
                throw new Error('Input contains overlapping ranges.');
            }
            // Prepare data for batch insertion
            // Use Prisma createMany for batch insertion
            const commissionEntries = this.createCommissionEntries(data);
            try {
                yield prisma_1.default.commission.createMany({
                    data: commissionEntries,
                    skipDuplicates: true, // Prevent duplication in case of unique constraint violations
                });
                return yield this.getFullCommissionTable();
            }
            catch (error) {
                throw new ApiError_1.default(400, 'Error creating commissions.');
            }
            // Return the newly created rows
        });
    }
    getCommissionsByPrice(price) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch all commissions matching the given price range
            const commissions = yield prisma_1.default.commission.findMany({
                where: {
                    startPrice: { lte: price },
                    endPrice: { gte: price },
                },
                orderBy: { level: 'asc' }, // Ensure the commissions are sorted by level
            });
            if (commissions.length === 0) {
                throw new Error(`No commissions found for price: ${price}`);
            }
            // Extract and return the commission amounts as an array
            return commissions;
        });
    }
    updateCommissionTable(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validation: Ensure amounts arrays are consistent
            if (!this.validateAmountsArray(data)) {
                throw new Error('All amounts arrays must have the same length (excluding empty elements).');
            }
            // Validation: Check for overlapping ranges
            if (this.hasOverlappingRanges(data)) {
                throw new Error('Input contains overlapping ranges.');
            }
            const commissionEntries = this.createCommissionEntries(data);
            // Transaction to replace the existing table
            yield prisma_1.default.$transaction([
                prisma_1.default.commission.deleteMany(),
                prisma_1.default.commission.createMany({
                    data: commissionEntries,
                    skipDuplicates: false, // Ensure all rows are inserted
                }),
            ]);
            return yield this.getFullCommissionTable();
        });
    }
    getFullCommissionTable() {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch all rows from the commission table
            const commissions = yield prisma_1.default.commission.findMany({
                orderBy: [{ startPrice: 'asc' }, { level: 'asc' }], // Sort by startPrice and level
            });
            // Group commissions by startPrice and endPrice
            const groupedData = commissions.reduce((acc, curr) => {
                const { startPrice, endPrice, level, commission } = curr;
                const key = `${startPrice}-${endPrice}`;
                if (!acc[key]) {
                    acc[key] = {
                        startPrice: Number(startPrice),
                        endPrice: Number(endPrice),
                        amounts: [],
                    };
                }
                // Place the commission in the correct position based on the level
                acc[key].amounts[level - 1] = commission.toNumber();
                return acc;
            }, {});
            // Convert grouped data to an array
            return Object.values(groupedData);
        });
    }
    calculateCommissions(userPhone, price) {
        return __awaiter(this, void 0, void 0, function* () {
            // Step 1: Fetch all commission levels for the given price
            const commissions = yield prisma_1.default.commission.findMany({
                where: {
                    startPrice: { lte: price },
                    endPrice: { gte: price },
                },
                orderBy: { level: 'asc' }, // Ensure commissions are sorted by level
            });
            // Step 2: Fetch all parents of the user using a recursive CTE-like logic
            const parentTree = yield prisma_1.default.$queryRawUnsafe(`
      WITH RECURSIVE parent_tree AS (
        -- Base case: start with the target user
        SELECT 
          "phoneNo", 
          "name", 
          0 AS "level", 
          "referredByPhone"
        FROM "users"
        WHERE "phoneNo" = '${userPhone}' -- Replace with the target user's phone number
  
        UNION ALL
  
        -- Recursive case: find the parent of each user in the tree
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
      WHERE "phoneNo" != '${userPhone}' -- Exclude the target user
      ORDER BY "level";
    `, userPhone);
            // Step 3: Map commissions to the parent tree
            const result = parentTree.map((parent) => {
                const commission = commissions.find(c => c.level === parent.level);
                return {
                    phoneNo: parent.phoneNo,
                    name: parent.name,
                    level: parent.level,
                    commissionAmount: commission ? commission.commission : 0, // Assign commission if found
                };
            });
            console.log({ commissions, parentTree, result });
            return result;
        });
    }
}
exports.CommissionService = CommissionService;
exports.default = new CommissionService();
