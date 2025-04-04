"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WALLET_CONFIG = void 0;
exports.WALLET_CONFIG = {
    bKash: {
        minWithdrawAmount: 50,
        smallAmountThreshold: 1000,
        smallAmountFee: 5,
        largeAmountFee: 10,
    },
    Nagad: {
        minWithdrawAmount: 50,
        smallAmountThreshold: 1000,
        smallAmountFee: 5,
        largeAmountFee: 10,
        largeAmountFeePerThousand: 5, // 5 TK per 1000 TK
    },
};
