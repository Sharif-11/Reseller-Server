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
const order_services_1 = __importDefault(require("../services/order.services"));
const tracking_services_1 = __importDefault(require("../services/tracking.services"));
class OrderController {
    /**
     * Create a new order
     */
    verifyOrderProducts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verifiedProducts = yield order_services_1.default.verifyOrderProducts(req.body);
                res.status(200).json({
                    statusCode: 200,
                    message: 'Products verified successfully',
                    success: true,
                    data: verifiedProducts,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const sellerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const order = yield order_services_1.default.createOrder(req.body, sellerId);
                res.status(201).json({
                    statusCode: 201,
                    message: 'অর্ডার সফলভাবে তৈরি করা হয়েছে',
                    success: true,
                    data: order,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    //   /**
    //    * Approve an order by Admin
    //    */
    //   async approveOrder(req: Request, res: Response, next: NextFunction) {
    //     try {
    //       const orderId = +req.params.orderId
    //       const transactionId = req.body.transactionId
    //       const order = await OrderServices.approveOrderByAdmin({
    //         orderId,transactionId
    //       })
    //       let message='অর্ডার সফলভাবে অনুমোদিত হয়েছে';
    //       if(order.orderStatus==='refunded'){
    //          message='বিক্রেতা ইতিমধ্যে এই অর্ডার বাতিল করেছেন বলে টাকা ফেরত দেওয়া হয়েছে'
    //       }
    //       if(order.orderStatus==='cancelled'){
    //          message='বিক্রেতা ইতিমধ্যে এই অর্ডার বাতিল করেছেন'
    //       }
    //       res.status(200).json({
    //         statusCode: 200,
    //         message,
    //         success: true,
    //         data: order,
    //       })
    //     } catch (error) {
    //       next(error)
    //     }
    // }
    /**
     * Cancel an order by Admin
     */
    cancelOrderByAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = +req.params.orderId;
                const remarks = req.body.remarks;
                const order = yield order_services_1.default.cancelOrderByAdmin(orderId, remarks);
                res.status(200).json({
                    statusCode: 200,
                    message: 'অর্ডার সফলভাবে বাতিল করা হয়েছে এবং টাকা ফেরত দেওয়া হয়েছে',
                    success: true,
                    data: order,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Cancel an order by Seller
     */
    cancelOrderBySeller(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const orderId = +req.params.orderId;
                const sellerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const order = yield order_services_1.default.cancelOrderBySeller(orderId, sellerId);
                res.status(200).json({
                    statusCode: 200,
                    message: 'অর্ডার সফলভাবে বাতিল হয়েছে',
                    success: true,
                    data: order,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Reject an order by Admin
     */
    // async rejectOrder(req: Request, res: Response, next: NextFunction) {
    //   try {
    //     const orderId = +req.params.orderId
    //     const remarks = req.body.remarks
    //     const order = await OrderServices.rejectOrderByAdmin(orderId, remarks)
    //     res.status(200).json({
    //       statusCode: 200,
    //       message: 'অর্ডার সফলভাবে বাতিল হয়েছে',
    //       success: true,
    //       data: order,
    //     })
    //   } catch (error) {
    //     next(error)
    //   }
    // }
    processOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = +req.params.orderId;
                const order = yield order_services_1.default.processOrderByAdmin(orderId);
                res.status(200).json({
                    statusCode: 200,
                    message: order.orderStatus === 'processing'
                        ? 'অর্ডার সফলভাবে প্রক্রিয়া করা হয়েছে'
                        : 'বিক্রেতা ইতিমধ্যে এই অর্ডার বাতিল করেছেন বলে টাকা ফেরত দেওয়া হয়েছে',
                    success: true,
                    data: order,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    shipOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = +req.params.orderId;
                const { trackingURL } = req.body;
                const courierName = tracking_services_1.default.getCourierFromUrl(trackingURL);
                const order = yield order_services_1.default.shipOrderByAdmin(orderId, courierName, trackingURL);
                res.status(200).json({
                    statusCode: 200,
                    message: 'অর্ডার সফলভাবে কুরিয়ারে পাঠানো হয়েছে',
                    success: true,
                    data: order,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    completeOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = +req.params.orderId;
                const { totalAmountPaidByCustomer } = req.body;
                const order = yield order_services_1.default.completeOrderByAdmin(orderId, totalAmountPaidByCustomer);
                res.status(200).json({
                    statusCode: 200,
                    message: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে',
                    success: true,
                    data: order,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    returnOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = +req.params.orderId;
                const order = yield order_services_1.default.returnOrderByAdmin(orderId);
                res.status(200).json({
                    statusCode: 200,
                    message: 'অর্ডার সফলভাবে ফেরত দেওয়া হয়েছে',
                    success: true,
                    data: order,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    faultyOrderByAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = +req.params.orderId;
                const order = yield order_services_1.default.faultyOrderByAdmin(orderId);
                res.status(200).json({
                    statusCode: 200,
                    message: 'বিক্রেতাকে পুনরায় অর্ডার করার জন্য অনুরোধ করা হয়েছে',
                    success: true,
                    data: order,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    reOrderFaulty(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const orderId = +req.params.orderId;
                const sellerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const order = yield order_services_1.default.reOrderFaulty(orderId, sellerId);
                res.status(200).json({
                    statusCode: 200,
                    message: 'আপনি সফলভাবে পুনরায় অর্ডার করেছেন',
                    success: true,
                    data: order,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getOrdersBySellerId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const sellerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { status, page, pageSize } = req.query;
                console.log({ status, page, pageSize });
                const orders = yield order_services_1.default.getOrdersByUserId({
                    sellerId: sellerId,
                    status: status,
                    page: page ? +page : 1,
                    pageSize: pageSize ? +pageSize : 10,
                });
                res.status(200).json({
                    statusCode: 200,
                    message: 'অর্ডার সফলভাবে পাওয়া গেছে',
                    success: true,
                    data: orders,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getOrdersForAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, page, pageSize } = req.query;
                const orders = yield order_services_1.default.getOrdersForAdmin({
                    status: status,
                    page: page ? +page : 1,
                    pageSize: pageSize ? +pageSize : 10,
                });
                res.status(200).json({
                    statusCode: 200,
                    message: 'অর্ডার সফলভাবে পাওয়া গেছে',
                    success: true,
                    data: orders,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSellerDashboardStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const sellerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const stats = yield order_services_1.default.getSellerDashboardStats(sellerId);
                res.status(200).json({
                    statusCode: 200,
                    message: 'ড্যাশবোর্ড পরিসংখ্যান সফলভাবে পাওয়া গেছে',
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAdminStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield order_services_1.default.getAdminDashboardStats();
                res.status(200).json({
                    statusCode: 200,
                    message: 'অ্যাডমিন পরিসংখ্যান সফলভাবে পাওয়া গেছে',
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new OrderController();
