import { Prisma } from "@prisma/client";
import config from "../config";
interface AmountToPayParams {
    productCount: number;
    sellerBalance: number;
    zilla: string;
    isVerified: boolean;
  }
  
  interface AmountToPayResult {
    needsPayment: boolean;
    amountToPay: number;
    deliveryCharge: number;
  }
  interface OrderProduct  {
    productName: string;
    productBasePrice: Prisma.Decimal;
    productTotalBasePrice: Prisma.Decimal;
    productTotalSellingPrice: number;
    productId: number;
    productQuantity: number;
    productImage: string;
    productSellingPrice: number;
    selectedOptions?: string;
}
interface productsSummary{
    totalProductQuantity: number;
    totalProductBasePrice: number;
    totalProductSellingPrice: number;
    totalCommission: number;
    totalAmount: number;
  }


const calculateExtraDeliveryCharge = (productCount: number) => {
    if (productCount <= 3) return 0;
    if (productCount === 4) return 10;
    
    // For 5+ products: 10 tk for the 4th product + 5 tk for every 2 additional products
    const additionalProducts = productCount - 4;
    let temp=0;
    if (additionalProducts % 2 === 0) {
      temp = additionalProducts / 2 * 5;
    } else {
      temp = (additionalProducts - 1) / 2 * 5;
    }
    return 10 + temp;
  };


  /**
   * Calculates payment requirements and amounts
   * @param params - Object containing calculation parameters
   * @returns Object with payment details
   */
const calculateAmountToPay = (params: AmountToPayParams): AmountToPayResult => {
    const { productCount, sellerBalance, zilla, isVerified } = params;
    
    const baseDeliveryCharge = zilla.toLowerCase().includes('dhaka') 
      ? config.deliveryChargeInsideDhaka
      : config.deliveryChargeOutsideDhaka;
    
    const extraDeliveryCharge = calculateExtraDeliveryCharge(productCount);
    const totalDeliveryCharge = baseDeliveryCharge + extraDeliveryCharge;
  
    let needsPayment = false;
    let amountToPay = 0;
  
    if (!isVerified) {
      // Unverified user
      if (sellerBalance >= totalDeliveryCharge) {
        needsPayment = false;
      } else {
        needsPayment = true;
        amountToPay = totalDeliveryCharge - sellerBalance;
      }
    } else {
      // Verified user
      if (sellerBalance >= 0) {
        if (sellerBalance >= totalDeliveryCharge) {
          needsPayment = false;
        } else {
          const remainingAfterCharge = sellerBalance - totalDeliveryCharge;
          if (remainingAfterCharge >= config.negativeBalanceLimit) {
            needsPayment = false;
          } else {
            needsPayment = true;
            amountToPay = totalDeliveryCharge - sellerBalance;
          }
        }
      } else {
        // Negative balance (for both user types)
        needsPayment = true;
        amountToPay = totalDeliveryCharge + Math.abs(sellerBalance);
      }
    }
  
    return {
      needsPayment,
      amountToPay,
      deliveryCharge:totalDeliveryCharge,
    };
  };


  
  /**
   * Calculates various totals from cart items
   * @param cartItems - Array of cart items
   * @returns Object containing all calculated totals
   */
const calculateProductsSummary = (cartItems:OrderProduct[]):productsSummary  => { 
   console.log('inside calculateProductsSummary')
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
      const itemSellingPrice = item.productSellingPrice* item.productQuantity;
      const itemCommission = item.productSellingPrice - item.productBasePrice.toNumber();

  
      return {
        totalProductQuantity: acc.totalProductQuantity + item.productQuantity,
        totalProductBasePrice: acc.totalProductBasePrice + itemBasePrice,
        totalProductSellingPrice: acc.totalProductSellingPrice + itemSellingPrice,
        totalCommission: acc.totalCommission + itemCommission* item.productQuantity,
        totalAmount: acc.totalAmount + itemSellingPrice
         
      };
    }, initialTotals);
  
    return totals;
  };
  
  interface ProductPriceDetails {
    productId: number;
    productBasePrice: number;
    productSellingPrice: number;
    productQuantity: number;
    totalProductBasePrice: number;  // basePrice * quantity for this item
    totalProductSellingPrice: number; // sellingPrice * quantity for this item
    commissionPerItem: number;
    totalCommission: number;       // (basePrice - sellingPrice) * quantity
  }
  
  /**
   * Calculates detailed price information for each cart item
   * @param cartItems - Array of cart items
   * @returns Array of objects with detailed price information for each item
   */

export {calculateExtraDeliveryCharge, calculateAmountToPay,calculateProductsSummary}