import { Prisma, OrderStatus, Order } from '@prisma/client'
import prisma from '../utils/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import userServices from './user.services'
import ApiError from '../utils/ApiError'
import walletServices from './wallet.services'
import productServices from './product.services'
import { calculateAmountToPay, calculateProductsSummary } from '../utils/order.utils'

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
    const {walletId:adminWalletId,walletName:adminWalletName,walletPhoneNo:adminWalletPhoneNo} = await walletServices.getWalletById(frontendData.adminWalletId)

    const existingTransactionId = await prisma.order.findFirst({
      where: {
        transactionId: frontendData.transactionId,
       
      }
    })

    if(existingTransactionId) {
      throw new ApiError(400, 'Transaction ID already exists')
    }
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
          totalAmount:totalAmount+deliveryCharge,
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

  // Basic order status update
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = await prisma.order.update({
      where: { orderId },
      data: { 
        orderStatus: status,
        orderUpdatedAt: new Date(),
        ...(status === OrderStatus.completed && { orderCompletedAt: new Date() })
      }
    })
    return order
  }

  // Basic order retrieval
  async getOrderById(orderId: number): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { orderId },
      include: { orderProducts: true }
    })
  }
}

export default new OrderServices()