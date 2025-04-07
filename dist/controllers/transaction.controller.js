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
const transaction_services_1 = __importDefault(require("../services/transaction.services"));
// class TransactionController {
//   /**
//    * Add deposit to user's account
//    */
//   async addDeposit(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { userId } = req.params
//       console.log({ userId })
//       const { amount, paymentMethod, transactionId, paymentPhoneNo } = req.body
//       const transaction = await transactionServices.addDeposit({
//         amount,
//         userId,
//         paymentMethod,
//         transactionId,
//         paymentPhoneNo,
//       })
//       res.status(201).json({
//         statusCode: 201,
//         message: 'অ্যাকাউন্টে সফলভাবে ব্যালেন্স যোগ করা হয়েছে',
//         success: true,
//         data: transaction,
//       })
//     } catch (error) {
//       next(error)
//     }
//   }
//   /**
//    * Withdraw balance from user's account
//    */
//   async withdrawBalance(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { amount, transactionId, paymentPhoneNo, paymentMethod, remarks } =
//         req.body
//       const { userId } = req.params
//       const transaction = await transactionServices.withdrawBalance({
//         amount,
//         userId,
//         transactionId,
//         paymentPhoneNo,
//         paymentMethod,
//         remarks,
//       })
//       res.status(200).json({
//         statusCode: 200,
//         message: 'টাকা সফলভাবে তুলে নেওয়া হয়েছে',
//         success: true,
//         data: transaction,
//       })
//     } catch (error) {
//       next(error)
//     }
//   }
// }
// export default new TransactionController()
class TransactionController {
    /**
     * Add deposit to user's account
     */
    getTransactionOfUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { page, pageSize } = req.query;
                const transactions = yield transaction_services_1.default.getTransactionOfUser({
                    userId,
                    page: Number(page) || 1,
                    pageSize: Number(pageSize) || 10
                });
                res.status(200).json({
                    statusCode: 200,
                    message: 'Transactions fetched successfully',
                    success: true,
                    data: transactions,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllTransactionForAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, pageSize } = req.query;
                const transactions = yield transaction_services_1.default.getAllTransactionForAdmin({
                    page: Number(page) || 1,
                    pageSize: Number(pageSize) || 10
                });
                res.status(200).json({
                    statusCode: 200,
                    message: 'Transactions fetched successfully',
                    success: true,
                    data: transactions,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new TransactionController();
