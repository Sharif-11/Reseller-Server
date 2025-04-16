import { Prisma, OrderStatus, Order } from '@prisma/client'
import prisma from '../utils/prisma'
import userServices from './user.services'
import ApiError from '../utils/ApiError'
import walletServices from './wallet.services'
import productServices from './product.services'
import { calculateAmountToDeductOrAddForOrder, calculateAmountToPay, calculateProductsSummary } from '../utils/order.utils'
import transactionServices from './transaction.services'

class OrderServices {
  /**
   * Create order from frontend data (dummy implementation)
   * @param frontendData - Minimal order data from frontend
   * @param sellerId - Authenticated seller's ID
   * @returns Created order
   */
  async createOrder(frontendData: {
    customerName: string
    customerPhoneNo: string
    customerZilla: string
    customerUpazilla: string
    deliveryAddress: string
    comments?: string
    products: Array<{
      productId: number
      productQuantity: number
      productImage: string
      productSellingPrice: number
      selectedOptions?: string
    }>
    isDeliveryChargePaidBySeller: boolean
    deliveryChargePaidBySeller?: number
    transactionId: string
    sellerWalletName: string
    sellerWalletPhoneNo: string
    adminWalletId: number
  }, sellerId: string): Promise<Order> {
    
    // [Backend Fetching Needed] Get complete seller info
    const seller = await userServices.getUserByUserId(sellerId)
    const {name:sellerName,phoneNo:sellerPhoneNo,balance:sellerBalance,isVerified:sellerVerified,shopName:sellerShopName}=seller

    
    // [Backend Fetching Needed] Get admin wallet info
  
    // [Backend Fetching Needed] Get product details (name, image, base price) for each product
    const enrichedProductsPromise = frontendData.products.map( async(product) => {
      const {productId,name:productName,basePrice:productBasePrice,images}=await productServices.getProduct(product.productId)
      const isValidImage=images.some((image)=>image.imageUrl===product.productImage)
      if(!isValidImage){
        throw new ApiError(400,'Invalid product image')
      }
      return {
        ...product,
        productName, 
        productBasePrice,
        productTotalBasePrice: productBasePrice.times(product.productQuantity),
        productTotalSellingPrice: product.productSellingPrice*product.productQuantity,
      }
    })
    const enrichedProducts = await Promise.all(enrichedProductsPromise);
    const {totalAmount,totalCommission,totalProductBasePrice,totalProductQuantity,totalProductSellingPrice}= calculateProductsSummary(enrichedProducts)
    const actualCommission=totalCommission;
    
    const {needsPayment,amountToPay,deliveryCharge}=calculateAmountToPay({
         zilla:frontendData.customerZilla,
         isVerified:seller.isVerified,
         sellerBalance:sellerBalance.toNumber(),
         productCount:totalProductQuantity



    })
     if(needsPayment && !frontendData.isDeliveryChargePaidBySeller){
         throw new ApiError(400,'Delivery charge must be paid')
     }
     if(needsPayment && frontendData.isDeliveryChargePaidBySeller && 
        (frontendData.deliveryChargePaidBySeller === undefined || 
         frontendData.deliveryChargePaidBySeller < amountToPay)){
      throw new ApiError(400,'The Amount Paid is not enough')
     }
     let adminWalletId=null;
     let adminWalletName=null;
     let adminWalletPhoneNo=null;

     if(needsPayment && frontendData.isDeliveryChargePaidBySeller){
      const {walletId,walletName,walletPhoneNo} = await walletServices.getWalletById(frontendData.adminWalletId)

      const existingTransactionId = await prisma.order.findFirst({
        where: {
          transactionId: frontendData.transactionId,
         
        }
      })
  
      if(existingTransactionId) {
        throw new ApiError(400, 'Transaction ID already exists')
      }
      adminWalletId=walletId;
      adminWalletName=walletName;
      adminWalletPhoneNo=walletPhoneNo;
     }
    
    
   

    // Create order in transaction
    const newOrder = await prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          // Seller info (from backend)
          sellerId,
          sellerName,
          sellerPhoneNo,
          sellerVerified,
          sellerShopName,
          sellerBalance,

          // Customer info (from frontend)
          customerName: frontendData.customerName,
          customerPhoneNo: frontendData.customerPhoneNo,
          customerZilla: frontendData.customerZilla,
          customerUpazilla: frontendData.customerUpazilla,
          deliveryAddress: frontendData.deliveryAddress,
          comments: frontendData.comments,

          // Payment info
          deliveryCharge,
          isDeliveryChargePaidBySeller: frontendData.isDeliveryChargePaidBySeller,
          deliveryChargePaidBySeller: frontendData.deliveryChargePaidBySeller,
          transactionId: frontendData.transactionId,
          sellerWalletName: frontendData.sellerWalletName,
          sellerWalletPhoneNo: frontendData.sellerWalletPhoneNo,
          // Admin wallet info (from backend)
          adminWalletId,
          adminWalletName,
          adminWalletPhoneNo,

          // Calculated totals
          totalAmount,
          totalCommission,
          actualCommission,
          totalProductBasePrice,
          totalProductSellingPrice,
          totalProductQuantity,


          // Products
          orderProducts: {
            create: enrichedProducts.map(product => ({
              productId: product.productId,
              productName: product.productName,
              productImage: product.productImage,
              productBasePrice: product.productBasePrice,
              productSellingPrice: product.productSellingPrice,
              productQuantity: product.productQuantity,
              productTotalBasePrice: product.productBasePrice.times(product.productQuantity),
              productTotalSellingPrice: product.productSellingPrice * product.productQuantity,
              selectedOptions: product.selectedOptions
            }))
          }
        },
        include: {
          orderProducts: true
        }
      })

      return order
    })

    return newOrder
  }
  /**
   * Get order by ID
   * @param orderId - Order ID to be fetched
   * @return Order details
   */
  async getOrderById(orderId: number): Promise<Order> {
    const order = await prisma.order.findUnique({
      where: {  orderId },
      include: { orderProducts: true }
    })

    if (!order) {
      throw new ApiError(404, 'Order not found')
    }

    return order
  }

  /**
   * Approve Order By Admin
   * @param orderId - Order ID to be approved
   * @return Updated order
   */
  async approveOrderByAdmin({orderId,transactionId}:{orderId:number,transactionId?:string}): Promise<Order> {
    // [Backend Fetching Needed] Get order details
    const order = await this.getOrderById(orderId)

    if(order.orderStatus !== OrderStatus.pending){
      throw new ApiError(400,'শুধুমাত্র পেন্ডিং অর্ডার অনুমোদন করা যাবে')
    }
    if(order.transactionVerified){
      throw new ApiError(400,'অর্ডার ইতোমধ্যে যাচাই করা হয়েছে')
    }
    // Check if the transaction ID matches the order's transaction ID
    if (order.isDeliveryChargePaidBySeller && order.transactionId !== transactionId) {
      throw new ApiError(400, 'ট্রানজেকশন আইডি মিলছে না')
    }
    // Check if the order is already is cancelled by user 
    if (order.cancelledByUser) {
        // Here We need to update the order status to cancelled , verify the transaction and add the amount to the seller wallets within transaction
          if(order.isDeliveryChargePaidBySeller){
            const updatedOrder=await prisma.$transaction(async(tx)=>{
              const updatedOrder=await tx.order.update({
                where: { orderId },
                data: {
                  orderStatus: OrderStatus.refunded,
                  transactionVerified:true,
                },
              });
              await transactionServices.refundOrderCancellation({
                tx,
                userId:order.sellerId,
                amount:order.deliveryChargePaidBySeller!.toNumber(),
               })
               return updatedOrder
            })
            return updatedOrder
          }
          else {
            const updatedOrder=await prisma.order.update({
              where: { orderId },
              data: {
                orderStatus: OrderStatus.cancelled,
                transactionVerified:true,
              },
            });
            return updatedOrder
          }
    }
    const {deductFromBalance,addToBalance}=calculateAmountToDeductOrAddForOrder({
      isDeliveryChargePaidBySeller:order.isDeliveryChargePaidBySeller,
      deliveryChargePaidBySeller:order.deliveryChargePaidBySeller?.toNumber() || null,
       totalDeliveryCharge:order.deliveryCharge.toNumber(),
    })
    if(deductFromBalance){
        // here we need to update use and deduct from balance as order deposit within transaction
        const updatedOrder=await prisma.$transaction(async(tx)=>{
          const updatedOrder=await tx.order.update({
            where: { orderId },
            data: {
              orderStatus: OrderStatus.approved,
              transactionVerified:true,
            },
          });
          await transactionServices.deductDeliveryChargeForOrderApproval({
            tx,
            userId:order.sellerId,
            amount:deductFromBalance,
           })
           return updatedOrder
        })
        return updatedOrder
        
    }
    else if(addToBalance){
        // update the order status to approved and add the amount to the seller wallets within transaction
        const updatedOrder=await prisma.$transaction(async(tx)=>{
          const updatedOrder=await tx.order.update({
            where: { orderId },
            data: {
              orderStatus: OrderStatus.approved,
              transactionVerified:true,
            },
          });
           await transactionServices.compensateDue({
            tx,
            userId:order.sellerId,
            amount:addToBalance,
            transactionId:order.transactionId!,
            paymentPhoneNo:order.sellerWalletPhoneNo!,
            paymentMethod:order.sellerWalletName!,
           })
           return updatedOrder
        })
      
        return updatedOrder


    }
    else {
       const updatedOrder=await prisma.order.update({
        where: { orderId },
        data: {
          orderStatus: OrderStatus.approved,
          transactionVerified:true,
        },
      });
      return updatedOrder
    }


}
/**
 * Reject Order By Admin
 * @param orderId - Order ID to be rejected
 * @return Updated order
  */
async rejectOrderByAdmin(orderId: number,remarks?:string): Promise<Order> {
  // [Backend Fetching Needed] Get order details
  const order = await this.getOrderById(orderId)

  if(order.orderStatus !== OrderStatus.pending){
    throw new ApiError(400,'শুধুমাত্র পেন্ডিং অর্ডার বাতিল করা যাবে')
  }
  if(order.transactionVerified){
    throw new ApiError(400,'অর্ডার ইতোমধ্যে যাচাই করা হয়েছে')
  }
  if(order.cancelledByUser){
    // delete the order  along with the products
     const deletedOrder=await prisma.order.delete({
      where: { orderId },
      include: { orderProducts: true }
    })
    return deletedOrder
   
  }
  // Update order status to rejected
 else{ const updatedOrder = await prisma.order.update({
    where: { orderId },
    data: {
      orderStatus: OrderStatus.rejected,
      transactionId: null,
      remarks: `${order.transactionId}=${remarks}`,
    },
  })

  return updatedOrder
}
}
/**
 * Cancel Order By Seller
 * @param orderId - Order ID to be cancelled
 * @return Updated order
 * */
async cancelOrderBySeller(orderId: number,sellerId:string): Promise<Order> {
  // [Backend Fetching Needed] Get order details
  const order = await this.getOrderById(orderId)
   
  if(order.cancelledByUser){
    throw new ApiError(400,'অর্ডার ইতোমধ্যে বাতিল করা হয়েছে')
  }
  // check if the order is belongs to the seller
  if(order.sellerId!==sellerId){
    throw new ApiError(400,'অর্ডারটি আপনার নয়')
  }
  const cancellable=order.orderStatus===OrderStatus.pending || order.orderStatus===OrderStatus.approved
  if(!cancellable){
    throw new ApiError(400,'শুধুমাত্র অনুমোদিত অথবা পেন্ডিং অর্ডার বাতিল করা যাবে')
  }

    const updatedOrder=await prisma.order.update({
      where: { orderId },
      data: {
        cancelledByUser:true,
      },
    })
    return updatedOrder
  

  // Update order status to cancelled and refunds the delivery charge to the seller within transaction
  
}
/**
 * Cancel Order By Admin
 * @param orderId - Order ID to be cancelled
 * @return Updated order
 */
 async cancelOrderByAdmin(orderId: number,remarks?:string): Promise<Order> {
  // [Backend Fetching Needed] Get order details
  const order = await this.getOrderById(orderId)
   const cancellable=order.orderStatus===OrderStatus.processing || order.orderStatus===OrderStatus.approved
  if(!cancellable){
    throw new ApiError(400,'শুধুমাত্র অনুমোদিত অথবা প্রক্রিয়াধীন অর্ডার বাতিল করা যাবে')
  }
  // Update order status to cancelled and refunds the delivery charge to the seller within transaction
   const updatedOrder=await prisma.$transaction(async(tx)=>{
    const updatedOrder=await tx.order.update({
      where: { orderId },
      data: {
        orderStatus: OrderStatus.cancelled,
        remarks: remarks ? remarks : null,
      },
    });
    await transactionServices.refundOrderCancellation({
      tx,
      userId:order.sellerId,
      amount:order.deliveryCharge.toNumber(),
   })
    return updatedOrder
   })
    return updatedOrder
   

   

 }
/**
 * Process Order By Admin
 * @param orderId - Order ID to be processed
 * @return Updated order
 * */
async processOrderByAdmin(orderId: number): Promise<Order> {
  // [Backend Fetching Needed] Get order details
  const order = await this.getOrderById(orderId)

  if(order.orderStatus !== OrderStatus.approved){
    throw new ApiError(400,'শুধুমাত্র অনুমোদিত অর্ডার প্রক্রিয়া করা যাবে')
  }
  // Update order status to processing
   if(order.cancelledByUser){
    // Here We need to update the order status to cancelled , verify the transaction and add the amount to the seller wallets within transaction
    const updatedOrder=await prisma.$transaction(async(tx)=>{
      const updatedOrder=await tx.order.update({
        where: { orderId },
        data: {
          orderStatus: OrderStatus.refunded,
          transactionVerified:true,
        },
      });
      await transactionServices.refundOrderCancellation({
        tx,
        userId:order.sellerId,
        amount:order.deliveryCharge!.toNumber(),
       })
       return updatedOrder
    })
    return updatedOrder
   }

  else {
    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: {
        orderStatus: OrderStatus.processing,
      },
    })

    return updatedOrder
  }


}

/**
 * Shipped Order By Admin
 * @param orderId - Order ID to be shipped
 * courierName - Courier name
 * trackingURL - Tracking URL
  * @return Updated order
 */
async shipOrderByAdmin(orderId: number,courierName:string,trackingURL:string): Promise<Order> {
  // [Backend Fetching Needed] Get order details
  const order = await this.getOrderById(orderId)

  if(order.orderStatus !== OrderStatus.processing){
    throw new ApiError(400,'শুধুমাত্র প্রক্রিয়াধীন অর্ডার শিপ করা যাবে')
  }
  // Update order status to shipped
  const updatedOrder = await prisma.order.update({
    where: { orderId },
    data: {
      orderStatus: OrderStatus.shipped,
      courierName,
      trackingURL,
    },
  })

  return updatedOrder
}
/**
 * Complete Order By Admin
 * @param orderId - Order ID to be delivered
 * amountPaidByCustomer - Amount paid by customer
 * @return Updated order
 */
async completeOrderByAdmin(orderId: number,amountPaidByCustomer:number): Promise<Order> {
  // [Backend Fetching Needed] Get order details
  const order = await this.getOrderById(orderId)

  if(order.orderStatus !== OrderStatus.shipped){
    throw new ApiError(400,'শুধুমাত্র শিপ করা অর্ডার সম্পন্ন করা যাবে')
  }
  // Update order status to completed and add the amount to the seller wallets within transaction
  if(amountPaidByCustomer<order.totalProductBasePrice.toNumber()){
    throw new ApiError(400,'প্রদত্ত পরিমাণ পণ্যের মোট বেস মূল্যের চেয়ে কম')
  }
  const actualCommission= amountPaidByCustomer - order.totalProductBasePrice.toNumber()
  const updatedOrder=await prisma.$transaction(async(tx)=>{
    const updatedOrder=await tx.order.update({
      where: { orderId },
      data: {
        orderStatus: OrderStatus.completed,
        totalAmountPaidByCustomer: amountPaidByCustomer,
        actualCommission,
        
      },
    });
    await transactionServices.addSellerCommission({
      tx,
      userId:order.sellerId,
      amount:actualCommission,
      userName:order.sellerName,
      userPhoneNo:order.sellerPhoneNo,
  
     })
    await transactionServices.returnDeliveryChargeAfterOrderCompletion({
      tx,
      amount:order.deliveryCharge.toNumber(),
      userName:order.sellerName,
      userPhoneNo:order.sellerPhoneNo,
      userId:order.sellerId,
    })

    
    
     return updatedOrder
  })
  return updatedOrder
}

/**
 * Return orders by Admin
  * @param orderId - Order ID to be returned
  * @return Updated order
  * */
async returnOrderByAdmin(orderId: number): Promise<Order> {
  // [Backend Fetching Needed] Get order details
  const order = await this.getOrderById(orderId)

  if(order.orderStatus !== OrderStatus.shipped){
    throw new ApiError(400,'শুধুমাত্র শিপ করা অর্ডার ফেরত দেওয়া যাবে')
  }
  // Update order status to returned and add the amount to the seller wallets within transaction
  const updatedOrder = await prisma.order.update({
    where: { orderId },
    data: {
      orderStatus: OrderStatus.returned,
    },
  })

  return updatedOrder
}
}
export default new OrderServices()