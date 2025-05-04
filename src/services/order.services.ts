import { Order, OrderStatus } from '@prisma/client'
import Decimal from 'decimal.js'
import config from '../config'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import referralService from './commission.utils'
import paymentServices from './payment.services'
import productServices from './product.services'
import transactionServices from './transaction.services'
import userServices from './user.services'
import walletServices from './wallet.services'

class OrderServices {
  calculateExtraDeliveryCharge(productCount: number) {
    if (productCount <= 3) return 0
    if (productCount === 4) return 10

    // For 5+ products: 10 tk for the 4th product + 5 tk for every 2 additional products
    const additionalProducts = productCount - 4
    let temp = 0
    if (additionalProducts % 2 === 0) {
      temp = (additionalProducts / 2) * 5
    } else {
      temp = ((additionalProducts - 1) / 2) * 5
    }
    return 10 + temp
  }
  deriveProductsSummary(
    products: {
      productName: string
      productBasePrice: Decimal
      productTotalBasePrice: Decimal
      productTotalSellingPrice: number
      productId: number
      productQuantity: number
      productImage: string
      productSellingPrice: number
      selectedOptions?: string
    }[]
  ) {
    const totalProductQuantity = products.reduce(
      (total, product) => total + product.productQuantity,
      0
    )
    const totalProductBasePrice = products.reduce(
      (total, product) => total.plus(product.productTotalBasePrice.toNumber()),
      new Decimal(0)
    )
    const totalProductSellingPrice = products.reduce(
      (total, product) => total + product.productTotalSellingPrice,
      0
    )
    const totalCommission = products.reduce(
      (total, product) =>
        total
          .plus(product.productTotalSellingPrice)
          .minus(product.productTotalBasePrice.toNumber()),
      new Decimal(0)
    )
    const totalAmount = products.reduce(
      (total, product) => total + product.productTotalSellingPrice,
      0
    )
    return {
      totalProductQuantity,
      totalProductBasePrice,
      totalProductSellingPrice,
      totalCommission,
      totalAmount,
      actualCommission: totalCommission.toNumber(),
      extraDeliveryCharge:
        this.calculateExtraDeliveryCharge(totalProductQuantity),
    }
  }
  async verifyOrderProducts(
    products: {
      productId: number
      productQuantity: number
      productImage: string
      productSellingPrice: number
    }[]
  ) {
    const productPremises = products.map(async product => {
      const {
        productId,
        name: productName,
        basePrice: productBasePrice,
        images,
        published,
      } = await productServices.getProduct(product.productId)
      const isValidImage = images.some(
        image => image.imageUrl === product.productImage
      )
      if (!published) {
        throw new ApiError(400, 'Hidden product cannot be ordered')
      }
      if (!isValidImage) {
        throw new ApiError(400, 'Invalid product image')
      }
      return {
        ...product,
        productName,
        productBasePrice,
        productTotalBasePrice: productBasePrice.times(product.productQuantity),
        productTotalSellingPrice:
          product.productSellingPrice * product.productQuantity,
      }
    })
    try {
      await Promise.all(productPremises)
      return true
    } catch (error) {
      return false
    }
  }
  /**
   * Create order from frontend data (dummy implementation)
   * @param frontendData - Minimal order data from frontend
   * @param sellerId - Authenticated seller's ID
   * @returns Created order
   */
  async createOrder(
    frontendData: {
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
      transactionId?: string
      sellerWalletName?: string
      sellerWalletPhoneNo?: string
      adminWalletId?: number
    },
    sellerId: string
  ): Promise<Order> {
    // [Backend Fetching Needed] Get complete seller info
    const seller = await userServices.getUserByUserId(sellerId)
    const {
      name: sellerName,
      phoneNo: sellerPhoneNo,
      balance: sellerBalance,
      isVerified: sellerVerified,
      shopName: sellerShopName,
    } = seller

    // [Backend Fetching Needed] Get product details (name, image, base price) for each product
    const enrichedProductsPromise = frontendData.products.map(async product => {
      const {
        productId,
        name: productName,
        basePrice: productBasePrice,
        images,
        published,
      } = await productServices.getProduct(product.productId)
      const isValidImage = images.some(
        image => image.imageUrl === product.productImage
      )
      if (!published) {
        throw new ApiError(400, 'Hidden product cannot be ordered')
      }
      if (!isValidImage) {
        throw new ApiError(400, 'Invalid product image')
      }
      return {
        ...product,
        productName,
        productBasePrice,
        productTotalBasePrice: productBasePrice.times(product.productQuantity),
        productTotalSellingPrice:
          product.productSellingPrice * product.productQuantity,
      }
    })
    const enrichedProducts = await Promise.all(enrichedProductsPromise)
    const {
      totalProductQuantity,
      totalProductBasePrice,
      totalProductSellingPrice,
      totalCommission,
      totalAmount,
      actualCommission,
      extraDeliveryCharge,
    } = this.deriveProductsSummary(enrichedProducts)
    const totalDeliveryCharge = frontendData.customerZilla
      .toLowerCase()
      .includes('dhaka')
      ? config.deliveryChargeInsideDhaka
      : config.deliveryChargeOutsideDhaka + extraDeliveryCharge

    if (
      sellerBalance.toNumber() < 0 &&
      !frontendData.isDeliveryChargePaidBySeller
    ) {
      throw new ApiError(400, 'You need to add balance to your wallet')
    }

    if (!sellerVerified) {
      if (
        sellerBalance.toNumber() < totalDeliveryCharge &&
        !frontendData.isDeliveryChargePaidBySeller
      ) {
        throw new ApiError(
          400,
          'You needs to pay the delivery charge in advance or add balance to your wallet'
        )
      }
    }
    if (frontendData.isDeliveryChargePaidBySeller) {
      if (frontendData.deliveryChargePaidBySeller! < totalDeliveryCharge) {
        throw new ApiError(400, 'Insufficient delivery charge paid by seller')
      }
    }

    // get admin wallet info
    let adminWalletName: string | null = null
    let adminWalletPhoneNo: string | null = null
    if (frontendData.adminWalletId) {
      const adminWallet = await walletServices.getWalletById(
        frontendData.adminWalletId
      )
      if (adminWallet) {
        adminWalletName = adminWallet.walletName
        adminWalletPhoneNo = adminWallet.walletPhoneNo
      } else {
        throw new ApiError(400, 'Invalid admin wallet ID')
      }
    }

    // we need to create the order within transaction, here we need to create a payment record also for the order
    const isDeductBalance =
      !sellerVerified &&
      !frontendData.isDeliveryChargePaidBySeller &&
      sellerBalance.toNumber() >= totalDeliveryCharge
    try {
      const order = await prisma.$transaction(async tx => {
        // Create order
        const createdOrder = await tx.order.create({
          data: {
            customerName: frontendData.customerName,
            customerPhoneNo: frontendData.customerPhoneNo,
            customerZilla: frontendData.customerZilla,
            customerUpazilla: frontendData.customerUpazilla,
            deliveryAddress: frontendData.deliveryAddress,
            comments: frontendData.comments,
            totalProductQuantity,
            totalProductBasePrice,
            totalProductSellingPrice,
            totalCommission,
            totalAmount,
            actualCommission,
            sellerId,
            sellerName,
            sellerPhoneNo,
            sellerShopName,
            sellerVerified,
            sellerBalance,
            orderStatus: frontendData.isDeliveryChargePaidBySeller
              ? 'unverified'
              : 'pending',
            adminWalletId: frontendData.adminWalletId!,
            isDeliveryChargePaidBySeller:
              frontendData.isDeliveryChargePaidBySeller,
            deliveryChargePaidBySeller:
              frontendData.deliveryChargePaidBySeller || null,
            transactionId: frontendData.transactionId || null,
            adminWalletName: adminWalletName || null,
            adminWalletPhoneNo: adminWalletPhoneNo || null,
            sellerWalletName: frontendData.sellerWalletName || null,
            sellerWalletPhoneNo: frontendData.sellerWalletPhoneNo || null,
            deliveryCharge: totalDeliveryCharge,
            cashOnAmount:
              frontendData.isDeliveryChargePaidBySeller || isDeductBalance
                ? totalAmount
                : totalAmount + totalDeliveryCharge,
            orderProducts: {
              create: enrichedProducts.map(product => ({
                productId: product.productId,
                productName: product.productName,
                productBasePrice: product.productBasePrice,
                productImage: product.productImage,
                productSellingPrice: product.productSellingPrice,
                selectedOptions: product.selectedOptions,
                productQuantity: product.productQuantity,
                productTotalBasePrice: product.productTotalBasePrice,
                productTotalSellingPrice: product.productTotalSellingPrice,
              })),
            },
          },
        })
        // Create order products

        if (frontendData.isDeliveryChargePaidBySeller) {
          try {
            await paymentServices.createOrderPaymentRequest({
              tx,
              amount: frontendData.deliveryChargePaidBySeller!,
              transactionId: frontendData.transactionId!,
              sellerWalletName: frontendData.sellerWalletName!,
              sellerWalletPhoneNo: frontendData.sellerWalletPhoneNo!,
              adminWalletId: frontendData.adminWalletId!,
              adminWalletName: adminWalletName!,
              adminWalletPhoneNo: adminWalletPhoneNo!,
              sellerId,
              sellerName,
              sellerPhoneNo,
              orderId: createdOrder.orderId,
            })
          } catch (error) {
            console.log('Error creating order payment request:', error)
            throw error
          }
        }
        if (isDeductBalance) {
          // we need to create a transaction record for the delivery charge deduction
          await transactionServices.deductDeliveryChargeForOrder({
            tx,
            userId: sellerId,
            amount: totalDeliveryCharge,
            remarks: 'অর্ডার ভেরিফিকেশনের জন্য ডেলিভারি চার্জ কাটা হয়েছে',
          })
        }
        return createdOrder
      })

      return order
    } catch (error) {
      throw error
    }
  }

  /**
   * Get order by ID
   * @param orderId - Order ID to be fetched
   * @return Order details
   */
  async getOrderById(orderId: number): Promise<Order> {
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { orderProducts: true },
    })

    if (!order) {
      throw new ApiError(404, 'অর্ডার পাওয়া যায়নি')
    }

    return order
  }

  // /**
  //  * Approve Order By Admin
  //  * @param orderId - Order ID to be approved
  //  * @return Updated order
  //  */
  // async approveOrderByAdmin({
  //   orderId,
  //   transactionId,
  // }: {
  //   orderId: number
  //   transactionId?: string
  // }): Promise<Order> {
  //   // [Backend Fetching Needed] Get order details
  //   const order = await this.getOrderById(orderId)

  //   if (order.orderStatus !== OrderStatus.pending) {
  //     throw new ApiError(400, 'শুধুমাত্র পেন্ডিং অর্ডার অনুমোদন করা যাবে')
  //   }
  //   if (order.transactionVerified) {
  //     throw new ApiError(400, 'অর্ডার ইতোমধ্যে যাচাই করা হয়েছে')
  //   }
  //   // Check if the transaction ID matches the order's transaction ID
  //   if (
  //     order.isDeliveryChargePaidBySeller &&
  //     order.transactionId !== transactionId
  //   ) {
  //     throw new ApiError(400, 'ট্রানজেকশন আইডি মিলছে না')
  //   }
  //   // Check if the order is already is cancelled by user
  //   if (order.cancelledByUser) {
  //     // Here We need to update the order status to cancelled , verify the transaction and add the amount to the seller wallets within transaction
  //     if (order.isDeliveryChargePaidBySeller) {
  //       const updatedOrder = await prisma.$transaction(async tx => {
  //         const updatedOrder = await tx.order.update({
  //           where: { orderId },
  //           data: {
  //             orderStatus: OrderStatus.refunded,
  //             transactionVerified: true,
  //           },
  //         })
  //         await transactionServices.refundOrderCancellation({
  //           tx,
  //           userId: order.sellerId,
  //           amount: order.deliveryChargePaidBySeller!.toNumber(),
  //         })
  //         return updatedOrder
  //       })
  //       return updatedOrder
  //     } else {
  //       const updatedOrder = await prisma.order.update({
  //         where: { orderId },
  //         data: {
  //           orderStatus: OrderStatus.cancelled,
  //           transactionVerified: true,
  //         },
  //       })
  //       return updatedOrder
  //     }
  //   }
  //   const { deductFromBalance, addToBalance } =
  //     calculateAmountToDeductOrAddForOrder({
  //       isDeliveryChargePaidBySeller: order.isDeliveryChargePaidBySeller,
  //       deliveryChargePaidBySeller:
  //         order.deliveryChargePaidBySeller?.toNumber() || null,
  //       totalDeliveryCharge: order.deliveryCharge.toNumber(),
  //     })
  //   if (deductFromBalance) {
  //     // here we need to update use and deduct from balance as order deposit within transaction
  //     const updatedOrder = await prisma.$transaction(async tx => {
  //       const updatedOrder = await tx.order.update({
  //         where: { orderId },
  //         data: {
  //           orderStatus: OrderStatus.approved,
  //           transactionVerified: true,
  //         },
  //       })
  //       await transactionServices.deductDeliveryChargeForOrderApproval({
  //         tx,
  //         userId: order.sellerId,
  //         amount: deductFromBalance,
  //       })
  //       return updatedOrder
  //     })
  //     return updatedOrder
  //   } else if (addToBalance) {
  //     // update the order status to approved and add the amount to the seller wallets within transaction
  //     const updatedOrder = await prisma.$transaction(async tx => {
  //       const updatedOrder = await tx.order.update({
  //         where: { orderId },
  //         data: {
  //           orderStatus: OrderStatus.approved,
  //           transactionVerified: true,
  //         },
  //       })
  //       await transactionServices.compensateDue({
  //         tx,
  //         userId: order.sellerId,
  //         amount: addToBalance,
  //         transactionId: order.transactionId!,
  //         paymentPhoneNo: order.sellerWalletPhoneNo!,
  //         paymentMethod: order.sellerWalletName!,
  //       })
  //       return updatedOrder
  //     })

  //     return updatedOrder
  //   } else {
  //     const updatedOrder = await prisma.order.update({
  //       where: { orderId },
  //       data: {
  //         orderStatus: OrderStatus.approved,
  //         transactionVerified: true,
  //       },
  //     })
  //     return updatedOrder
  //   }
  // }
  // /**
  //  * Reject Order By Admin
  //  * @param orderId - Order ID to be rejected
  //  * @return Updated order
  //  */
  // async rejectOrderByAdmin(orderId: number, remarks?: string): Promise<Order> {
  //   // [Backend Fetching Needed] Get order details
  //   const order = await this.getOrderById(orderId)

  //   if (order.orderStatus !== OrderStatus.pending) {
  //     throw new ApiError(400, 'শুধুমাত্র পেন্ডিং অর্ডার বাতিল করা যাবে')
  //   }
  //   if (order.transactionVerified) {
  //     throw new ApiError(400, 'অর্ডার ইতোমধ্যে যাচাই করা হয়েছে')
  //   }
  //   if (order.cancelledByUser) {
  //     // delete the order  along with the products
  //     const deletedOrder = await prisma.order.delete({
  //       where: { orderId },
  //       include: { orderProducts: true },
  //     })
  //     return deletedOrder
  //   }
  //   // Update order status to rejected
  //   else {
  //     const updatedOrder = await prisma.order.update({
  //       where: { orderId },
  //       data: {
  //         orderStatus: OrderStatus.rejected,
  //         transactionId: null,
  //         remarks: `${order.transactionId}=${remarks}`,
  //       },
  //     })

  //     return updatedOrder
  //   }
  // }
  // /**
  //  * Cancel Order By Seller
  //  * @param orderId - Order ID to be cancelled
  //  * @return Updated order
  //  * */
  async cancelOrderBySeller(orderId: number, sellerId: string): Promise<Order> {
    // [Backend Fetching Needed] Get order details
    const order = await this.getOrderById(orderId)

    if (order.cancelledBySeller) {
      throw new ApiError(400, 'অর্ডার ইতোমধ্যে বাতিল করা হয়েছে')
    }
    // check if the order is belongs to the seller
    if (order.sellerId !== sellerId) {
      throw new ApiError(400, 'অর্ডারটি আপনার নয়')
    }
    const cancellable =
      order.orderStatus === OrderStatus.pending ||
      order.orderStatus === OrderStatus.unverified
    if (!cancellable) {
      throw new ApiError(
        400,
        'শুধুমাত্র পেন্ডিং অথবা অযাচাইকৃত অর্ডার বাতিল করা যাবে'
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: {
        cancelledBySeller: true,
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
  async cancelOrderByAdmin(orderId: number, remarks?: string): Promise<Order> {
    // [Backend Fetching Needed] Get order details
    const order = await this.getOrderById(orderId)
    const cancellable =
      order.orderStatus === OrderStatus.processing ||
      order.orderStatus === OrderStatus.pending
    if (!cancellable) {
      throw new ApiError(
        400,
        'শুধুমাত্র প্রক্রিয়াধীন অথবা পেন্ডিং অর্ডার বাতিল করা যাবে'
      )
    }
    const refundable =
      order.isDeliveryChargePaidBySeller ||
      (!order.sellerVerified &&
        !order.isDeliveryChargePaidBySeller &&
        order.sellerBalance.toNumber() >= order.deliveryCharge.toNumber())
    if (refundable) {
      // Here We need to update the order status to cancelled , verify the transaction and add the amount to the seller wallets within transaction
      const updatedOrder = await prisma.$transaction(async tx => {
        const updatedOrder = await tx.order.update({
          where: { orderId },
          data: {
            orderStatus: OrderStatus.refunded,
            remarks: `${order.transactionId}=${remarks}`,
          },
        })
        await transactionServices.refundOrderCancellation({
          tx,
          userId: order.sellerId,
          amount: order.deliveryCharge.toNumber(),
        })
        return updatedOrder
      })
      return updatedOrder
    } else {
      const updatedOrder = await prisma.order.update({
        where: { orderId },
        data: {
          orderStatus: OrderStatus.cancelled,
          remarks: `${order.transactionId}=${remarks}`,
        },
      })
      return updatedOrder
    }
  }
  /**
   * Process Order By Admin
   * @param orderId - Order ID to be processed
   * @return Updated order
   * */
  async processOrderByAdmin(orderId: number): Promise<Order> {
    // [Backend Fetching Needed] Get order details
    const order = await this.getOrderById(orderId)

    if (order.orderStatus !== OrderStatus.pending) {
      throw new ApiError(400, 'শুধুমাত্র পেন্ডিং অর্ডার প্রক্রিয়া করা যাবে')
    }
    // Update order status to processing
    if (order.cancelledBySeller) {
      await this.cancelOrderByAdmin(orderId, 'Order is cancelled by user')
      return await this.getOrderById(orderId)
    } else {
      const updatedOrder = await prisma.order.update({
        where: { orderId },
        data: {
          orderStatus: OrderStatus.processing,
        },
      })

      return updatedOrder
    }
  }

  // /**
  //  * Shipped Order By Admin
  //  * @param orderId - Order ID to be shipped
  //  * courierName - Courier name
  //  * trackingURL - Tracking URL
  //  * @return Updated order
  //  */
  async shipOrderByAdmin(
    orderId: number,
    courierName: string,
    trackingURL: string
  ): Promise<Order> {
    // [Backend Fetching Needed] Get order details
    const order = await this.getOrderById(orderId)

    if (order.orderStatus !== OrderStatus.processing) {
      throw new ApiError(400, 'শুধুমাত্র প্রক্রিয়াধীন অর্ডার শিপ করা যাবে')
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
  async completeOrderByAdmin(
    orderId: number,
    amountPaidByCustomer: number
  ): Promise<Order> {
    // [Backend Fetching Needed] Get order details
    const order = await this.getOrderById(orderId)

    if (order.orderStatus !== OrderStatus.shipped) {
      throw new ApiError(400, 'শুধুমাত্র শিপ করা অর্ডার সম্পন্ন করা যাবে')
    }
    // Update order status to completed and add the amount to the seller wallets within transaction
    if (amountPaidByCustomer < order.totalProductBasePrice.toNumber()) {
      throw new ApiError(400, 'প্রদত্ত পরিমাণ পণ্যের মোট বেস মূল্যের চেয়ে কম')
    }
    const actualCommission =
      amountPaidByCustomer - order.totalProductBasePrice.toNumber()
    const updatedOrder = await prisma.$transaction(async tx => {
      const updatedOrder = await tx.order.update({
        where: { orderId },
        data: {
          orderStatus: OrderStatus.completed,
          totalAmountPaidByCustomer: amountPaidByCustomer,
          actualCommission,
        },
      })
      // count how many order are completed
      const completedOrdersCount = await tx.order.count({
        where: {
          orderStatus: OrderStatus.completed,
          sellerId: order.sellerId,
        },
      })
      // verify the seller
      const isVerified =
        completedOrdersCount >= config.minimumOrderCompletedToBeVerified
          ? true
          : false
      await tx.user.update({
        where: { userId: order.sellerId },
        data: { isVerified },
      })

      await transactionServices.addSellerCommission({
        tx,
        userId: order.sellerId,
        amount: actualCommission,
        userName: order.sellerName,
        userPhoneNo: order.sellerPhoneNo,
      })
      // await transactionServices.returnDeliveryChargeAfterOrderCompletion({
      //   tx,
      //   amount: order.deliveryCharge.toNumber(),
      //   userName: order.sellerName,
      //   userPhoneNo: order.sellerPhoneNo,
      //   userId: order.sellerId,
      // })
      // find the seller referrer and add referral commission if exists
      const seller = await userServices.getUserDetailByUserId({
        tx,
        userId: order.sellerId,
      })
      const referrer = seller.referredBy
      if (referrer) {
        const referralCommission = referralService.calculateReferralCommission(
          1,
          order.totalProductBasePrice.toNumber()
        )
        await transactionServices.addReferralCommission({
          tx,
          userId: referrer.userId,
          amount: referralCommission,
          userName: referrer.name,
          userPhoneNo: referrer.phoneNo,
          referralLevel: 1,
          reference: JSON.stringify({
            name: order.sellerName,
            phoneNo: order.sellerPhoneNo,
            orderId: order.orderId,
            orderAmount: order.totalProductBasePrice.toNumber(),
            orderCommission: referralCommission,
            orderDate: order.orderCreatedAt,
            referralLevel: 1,
          }),
        })
      }

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

    if (order.orderStatus !== OrderStatus.shipped) {
      throw new ApiError(400, 'শুধুমাত্র শিপ করা অর্ডার ফেরত দেওয়া যাবে')
    }
    // Update order status to returned and add the amount to the seller wallets within transaction
    if (!order.isDeliveryChargePaidBySeller) {
      // update the order status to returned and deduct the amount from the seller wallets within transaction
      const updatedOrder = await prisma.$transaction(async tx => {
        const updatedOrder = await tx.order.update({
          where: { orderId },
          data: {
            orderStatus: OrderStatus.returned,
          },
        })
        await transactionServices.deductDeliveryChargeForOrder({
          tx,
          userId: order.sellerId,
          amount: order.deliveryCharge.toNumber(),
          remarks: 'অর্ডার ফেরত আসার কারণে ডেলিভারি চার্জ কাটা হয়েছে',
        })
        return updatedOrder
      })
      return updatedOrder
    }
    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: {
        orderStatus: OrderStatus.returned,
      },
    })
    return updatedOrder
  }
  async faultyOrderByAdmin(orderId: number, remarks?: string): Promise<Order> {
    // [Backend Fetching Needed] Get order details
    const order = await this.getOrderById(orderId)

    if (order.orderStatus !== OrderStatus.shipped) {
      throw new ApiError(400, 'শুধুমাত্র শিপ করা অর্ডার ফল্টি করা যাবে')
    }
    // Update order status to returned and add the amount to the seller wallets within transaction
    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: {
        orderStatus: OrderStatus.faulty,
        remarks,
      },
    })
    return updatedOrder
  }
  async reOrderFaulty(orderId: number): Promise<Order> {
    // [Backend Fetching Needed] Get order details
    const order = await this.getOrderById(orderId)

    if (order.orderStatus !== OrderStatus.faulty) {
      throw new ApiError(400, 'শুধুমাত্র ফল্টি অর্ডার পুনরায় অর্ডার করা যাবে')
    }
    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: {
        orderStatus: OrderStatus.pending,
      },
    })
    return updatedOrder
  }
  /**
   * Get all orders by user ID with pagination and filtering by status, status may be an array or string
   * @param sellerId - Seller ID to fetch orders for
   * @return List of orders
   */
  async getOrdersByUserId({
    sellerId,
    status,
    page = 1,
    pageSize = 10,
  }: {
    sellerId: string
    status?: OrderStatus | OrderStatus[]
    page?: number
    pageSize?: number
  }) {
    const orders = await prisma.order.findMany({
      where: {
        sellerId,
        ...(status && {
          orderStatus: Array.isArray(status) ? { in: status } : status,
        }),
      },
      include: { orderProducts: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        orderCreatedAt: 'desc',
      },
    })
    const totalOrders = await prisma.order.count({
      where: {
        sellerId,
        ...(status && {
          orderStatus: Array.isArray(status) ? { in: status } : status,
        }),
      },
    })
    const totalPages = Math.ceil(totalOrders / pageSize)
    return {
      orders,
      totalOrders,
      totalPages,
      currentPage: page,
      pageSize,
    }
  }
  async getOrdersForAdmin({
    status,
    page = 1,
    pageSize = 10,
  }: {
    status?: OrderStatus | OrderStatus[]
    page?: number
    pageSize?: number
  }) {
    const orders = await prisma.order.findMany({
      where: {
        ...(status && {
          orderStatus: Array.isArray(status) ? { in: status } : status,
        }),
      },
      include: { orderProducts: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        orderCreatedAt: 'desc',
      },
    })
    const totalOrders = await prisma.order.count({
      where: {
        ...(status && {
          orderStatus: Array.isArray(status) ? { in: status } : status,
        }),
      },
    })
    const totalPages = Math.ceil(totalOrders / pageSize)
    return {
      orders,
      totalOrders,
      totalPages,
      currentPage: page,
      pageSize,
    }
  }
}
export default new OrderServices()
