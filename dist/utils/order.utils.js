"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProductsSummary = exports.calculateAmountToPay = exports.calculateExtraDeliveryCharge = void 0;
const config_1 = __importDefault(require("../config"));
const calculateExtraDeliveryCharge = (productCount) => {
    if (productCount <= 3)
        return 0;
    if (productCount === 4)
        return 10;
    // For 5+ products: 10 tk for the 4th product + 5 tk for every 2 additional products
    const additionalProducts = productCount - 4;
    let temp = 0;
    if (additionalProducts % 2 === 0) {
        temp = additionalProducts / 2 * 5;
    }
    else {
        temp = (additionalProducts - 1) / 2 * 5;
    }
    return 10 + temp;
};
exports.calculateExtraDeliveryCharge = calculateExtraDeliveryCharge;
/**
 * Calculates payment requirements and amounts
 * @param params - Object containing calculation parameters
 * @returns Object with payment details
 */
const calculateAmountToPay = (params) => {
    const { productCount, sellerBalance, zilla, isVerified } = params;
    const baseDeliveryCharge = zilla.toLowerCase().includes('dhaka')
        ? config_1.default.deliveryChargeInsideDhaka
        : config_1.default.deliveryChargeOutsideDhaka;
    const extraDeliveryCharge = calculateExtraDeliveryCharge(productCount);
    const totalDeliveryCharge = baseDeliveryCharge + extraDeliveryCharge;
    let needsPayment = false;
    let amountToPay = 0;
    if (!isVerified) {
        // Unverified user
        if (sellerBalance >= totalDeliveryCharge) {
            needsPayment = false;
        }
        else {
            needsPayment = true;
            amountToPay = totalDeliveryCharge - sellerBalance;
        }
    }
    else {
        // Verified user
        if (sellerBalance >= 0) {
            if (sellerBalance >= totalDeliveryCharge) {
                needsPayment = false;
            }
            else {
                const remainingAfterCharge = sellerBalance - totalDeliveryCharge;
                if (remainingAfterCharge >= config_1.default.negativeBalanceLimit) {
                    needsPayment = false;
                }
                else {
                    needsPayment = true;
                    amountToPay = totalDeliveryCharge - sellerBalance;
                }
            }
        }
        else {
            // Negative balance (for both user types)
            needsPayment = true;
            amountToPay = totalDeliveryCharge + Math.abs(sellerBalance);
        }
    }
    return {
        needsPayment,
        amountToPay,
        deliveryCharge: totalDeliveryCharge,
    };
};
exports.calculateAmountToPay = calculateAmountToPay;
/**
 * Calculates various totals from cart items
 * @param cartItems - Array of cart items
 * @returns Object containing all calculated totals
 */
const calculateProductsSummary = (cartItems) => {
    console.log('inside calculateProductsSummary');
    // Initialize all totals to 0
    const initialTotals = {
        totalProductQuantity: 0,
        totalProductBasePrice: 0,
        totalProductSellingPrice: 0,
        totalCommission: 0,
        totalAmount: 0
    };
    // Calculate all totals in a single reduce operation for efficiency
    const totals = cartItems.reduce((acc, item) => {
        const itemBasePrice = item.productBasePrice.times(item.productQuantity).toNumber();
        const itemSellingPrice = item.productSellingPrice * item.productQuantity;
        const itemCommission = item.productSellingPrice - item.productBasePrice.toNumber();
        return {
            totalProductQuantity: acc.totalProductQuantity + item.productQuantity,
            totalProductBasePrice: acc.totalProductBasePrice + itemBasePrice,
            totalProductSellingPrice: acc.totalProductSellingPrice + itemSellingPrice,
            totalCommission: acc.totalCommission + itemCommission * item.productQuantity,
            totalAmount: acc.totalAmount + itemSellingPrice
        };
    }, initialTotals);
    return totals;
};
exports.calculateProductsSummary = calculateProductsSummary;
