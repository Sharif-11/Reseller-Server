import { WALLET_CONFIG, WithdrawalDetails } from "../types/withdraw.types";

export const calculateWithdrawal = (
   {
    walletName,
    walletPhoneNo,
    amount,
  }: {
    walletName: 'bKash' | 'Nagad';
    walletPhoneNo: string;
    amount: number;
   }
  ): WithdrawalDetails => {
    const config = WALLET_CONFIG[walletName];
    
    // Validate minimum amount
    if (amount < config.minWithdrawAmount) {
    throw new Error(`নূন্যতম উত্তোলনের পরিমাণ ${config.minWithdrawAmount} টাকা`);
    }
  
    let transactionFee: number;
  
    if (amount <= config.smallAmountThreshold) {
      transactionFee = config.smallAmountFee;
    }
    else if(walletName === 'bKash' && amount >config.smallAmountThreshold) {
        // For bKash, calculate 10 TK for amounts over 1000
        transactionFee = config.largeAmountFee;
    }
    else if(walletName === 'Nagad' && amount > config.smallAmountThreshold) {
        // For Nagad, calculate 5 TK for amounts over 1000
        transactionFee = Math.floor(amount / 1000) * config.largeAmountFeePerThousand!;
    }
    else {
      throw new Error("Invalid amount");
    }

     
    const actualAmount = amount - transactionFee;
  
    return {
      amount,
      actualAmount,
      transactionFee,
      walletName,
      walletPhoneNo,
    };
  };