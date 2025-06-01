import { Prisma } from '@prisma/client'
import { HttpStatusCode } from 'axios'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import transactionServices from './transaction.services'
import userServices from './user.services'
import walletServices from './wallet.services'

class PaymentService {
  private async checkTransactionIdExists(transactionId: string) {
    const existingTransaction = await prisma.payment.findUnique({
      where: { transactionId },
    })
    if (existingTransaction) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'এই ট্রানজেকশন আইডি ইতিমধ্যে ব্যবহৃত হয়েছে'
      )
    }
  }
  async createDuePaymentRequest({
    adminWalletId,
    amount,
    transactionId,
    sellerWalletName,
    sellerWalletPhoneNo,
    sellerId,
  }: {
    amount: number
    transactionId: string
    sellerWalletName: string
    sellerWalletPhoneNo: string
    adminWalletId: number
    sellerId: string
  }) {
    const adminWallet = await walletServices.getWalletById(adminWalletId)
    if (!adminWallet) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Admin wallet not found')
    }
    const adminWalletName = adminWallet.walletName
    const adminWalletPhoneNo = adminWallet.walletPhoneNo
    const seller = await userServices.getUserByUserId(sellerId)
    if (!seller) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Seller not found')
    }
    const sellerName = seller.name
    const sellerPhoneNo = seller.phoneNo
    //check unique transactionId
    await this.checkTransactionIdExists(transactionId)
    const existingPaymentRequest = await prisma.payment.findFirst({
      where: {
        sellerId,
        paymentType: 'DuePayment',
        paymentStatus: 'pending',
      },
    })
    if (existingPaymentRequest) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Pending payment request already exists for this seller'
      )
    }
    const duePaymentRequest = await prisma.payment.create({
      data: {
        amount,
        transactionId,
        sellerWalletName,
        sellerWalletPhoneNo,
        sellerName,
        sellerPhoneNo,
        adminWalletId,
        adminWalletName,
        adminWalletPhoneNo,
        sender: 'Seller',
        paymentType: 'DuePayment',
        sellerId,
        actualAmount: amount,
      },
    })
    return duePaymentRequest
  }
  async createOrderPaymentRequest({
    tx,
    amount,
    transactionId,
    sellerWalletName,
    sellerWalletPhoneNo,
    sellerName,
    sellerPhoneNo,
    adminWalletId,
    adminWalletName,
    adminWalletPhoneNo,
    orderId,
    sellerId,
  }: {
    tx: Prisma.TransactionClient
    amount: number
    transactionId: string
    sellerWalletName: string
    sellerWalletPhoneNo: string
    sellerName: string
    sellerPhoneNo: string
    adminWalletId: number
    adminWalletName: string
    adminWalletPhoneNo: string
    orderId: number
    sellerId: string
  }) {
    await this.checkTransactionIdExists(transactionId)
    const orderPaymentRequest = await tx.payment.create({
      data: {
        amount,
        actualAmount: amount,
        transactionId,
        sellerWalletName,
        sellerWalletPhoneNo,
        sellerName,
        sellerPhoneNo,
        adminWalletId,
        adminWalletName,
        adminWalletPhoneNo,
        orderId,
        sender: 'Seller',
        paymentType: 'OrderPayment',
        sellerId,
      },
    })
    return orderPaymentRequest
  }
  async createWithdrawPaymentRequest({
    tx,
    amount,
    transactionId,
    sellerWalletName,
    sellerWalletPhoneNo,
    sellerName,
    sellerPhoneNo,
    adminWalletName,
    adminWalletPhoneNo,
    sellerId,
    withdrawId,
    actualAmount,
    transactionFee,
  }: {
    tx: Prisma.TransactionClient
    amount: number
    transactionId: string
    sellerWalletName: string
    sellerWalletPhoneNo: string
    sellerName: string
    sellerPhoneNo: string
    adminWalletName: string
    adminWalletPhoneNo: string
    sellerId: string
    withdrawId: string
    actualAmount: number
    transactionFee: number
  }) {
    await this.checkTransactionIdExists(transactionId)
    const withdrawPaymentRequest = await tx.payment.create({
      data: {
        amount,
        transactionId,
        sellerWalletName,
        sellerWalletPhoneNo,
        sellerName,
        sellerPhoneNo,
        adminWalletName,
        adminWalletPhoneNo,
        sender: 'Admin',
        paymentType: 'WithdrawPayment',
        paymentStatus: 'verified',
        sellerId,
        withdrawId,
        actualAmount,
        transactionFee,
      },
    })
    return withdrawPaymentRequest
  }
  async verifyDuePaymentRequest({
    paymentId,
    amount,
    transactionId,
  }: {
    paymentId: number
    transactionId: string
    amount: number
  }) {
    const existingPayment = await prisma.payment.findUnique({
      where: { paymentId, paymentType: 'DuePayment' },
    })
    if (!existingPayment) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        'পেমেন্ট অনুরোধ পাওয়া যায়নি'
      )
    }
    if (existingPayment.paymentStatus !== 'pending') {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'শুধুমাত্র অমীমাংসিত পেমেন্ট অনুরোধগুলি যাচাই করা যেতে পারে'
      )
    }
    if (transactionId !== existingPayment.transactionId) {
      throw new ApiError(HttpStatusCode.BadRequest, 'ট্রানজেকশন আইডি  মিলছে না')
    }
    // here we need to verify the payment along with adding the balance to the seller wallet within a transaction
    const payment = await prisma.$transaction(async tx => {
      const updatedPayment = await tx.payment.update({
        where: { paymentId },
        data: {
          paymentStatus: 'verified',
          transactionId,
          actualAmount: amount,
          processedAt: new Date(),
        },
      })
      const updatedUser = await transactionServices.compensateDue({
        tx,
        amount: Number(updatedPayment.amount),
        userId: updatedPayment.sellerId,
        transactionId: String(updatedPayment.transactionId),
        paymentPhoneNo: updatedPayment.sellerWalletPhoneNo,
        paymentMethod: updatedPayment.sellerWalletName,
      })
      return { updatedPayment, updatedUser }
    })
    return payment.updatedPayment
  }
  async verifyOrderPaymentRequest({
    paymentId,
    transactionId,
    amount,
  }: {
    paymentId: number
    transactionId: string
    amount: number
  }) {
    const existingPayment = await prisma.payment.findUnique({
      where: { paymentId, paymentType: 'OrderPayment' },
    })
    if (!existingPayment) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        'পেমেন্ট অনুরোধ পাওয়া যায়নি'
      )
    }
    if (existingPayment.paymentStatus !== 'pending') {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'শুধুমাত্র অমীমাংসিত পেমেন্ট অনুরোধগুলি যাচাই করা যেতে পারে'
      )
    }
    if (transactionId !== existingPayment.transactionId) {
      throw new ApiError(HttpStatusCode.BadRequest, 'ট্রানজেকশন আইডি  মিলছে না')
    }
    // we need to make the payment verified and also update the transactionVerified field of the order
    const payment = await prisma.$transaction(async tx => {
      const updatedPayment = await tx.payment.update({
        where: { paymentId },
        data: {
          paymentStatus: 'verified',
          transactionId,
          actualAmount: amount,
          processedAt: new Date(),
        },
      })

      const updatedOrder = await tx.order.update({
        where: { orderId: updatedPayment.orderId! },
        data: {
          transactionVerified: true,
          orderStatus: 'pending',
        },
      })
      if (updatedOrder.deliveryCharge.toNumber() > amount) {
        throw new ApiError(
          HttpStatusCode.BadRequest,
          'Amount is less than delivery charge'
        )
      }

      return { updatedPayment, updatedOrder }
    })
  }

  async rejectPaymentRequest({
    tx,
    paymentId,
    remarks,
  }: {
    tx?: Prisma.TransactionClient
    paymentId: number
    remarks?: string
  }) {
    const existingPayment = await (tx || prisma).payment.findUnique({
      where: { paymentId },
    })
    if (!existingPayment) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Payment request not found')
    }
    if (existingPayment.paymentStatus !== 'pending') {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Only pending payment requests can be rejected'
      )
    }
    return await (tx || prisma).payment.update({
      where: { paymentId },
      data: {
        paymentStatus: 'rejected',
        transactionId: null,
        remarks,
      },
    })
  }
  async rejectOrderPaymentRequest({
    paymentId,
    remarks,
  }: {
    paymentId: number
    remarks?: string
  }) {
    const existingPayment = await prisma.payment.findUnique({
      where: { paymentId, paymentType: 'OrderPayment' },
    })
    if (!existingPayment) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Payment request not found')
    }
    if (existingPayment.paymentStatus !== 'pending') {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Only pending payment requests can be rejected'
      )
    }
    // we need to make the payment rejected and also update the orderStatus to rejected and make transaction id null
    const payment = await prisma.$transaction(async tx => {
      const updatedPayment = await tx.payment.update({
        where: { paymentId },
        data: {
          paymentStatus: 'rejected',
          transactionId: null,
          remarks,
        },
      })
      const updatedOrder = await tx.order.update({
        where: { orderId: existingPayment.orderId! },
        data: {
          orderStatus: 'rejected',
          transactionVerified: false,
        },
      })
      return { updatedPayment, updatedOrder }
    })
  }
  async getAllPaymentsOfASeller({
    userId,
    page,
    limit,
    status,
  }: {
    userId: string
    page: number
    limit: number
    status?: string
  }) {
    const payments = await prisma.payment.findMany({
      where: {
        sellerId: userId,
        ...(status && { paymentStatus: status as any }),
      },
      orderBy: { paymentDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })
    const totalPayments = await prisma.payment.count({
      where: { sellerId: userId },
    })
    return {
      payments,
      totalPayments,
      currentPage: page,
      totalPages: Math.ceil(totalPayments / limit),
    }
  }
  async getAllPaymentsForAdmin({
    page,
    limit,
    status,
  }: {
    page: number
    limit: number
    status?: string
  }) {
    const payments = await prisma.payment.findMany({
      where: {
        ...(status && { paymentStatus: status as any }),
      },
      orderBy: { paymentDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })
    const totalPayments = await prisma.payment.count()
    return {
      payments,
      totalPayments,
      currentPage: page,
      totalPages: Math.ceil(totalPayments / limit),
    }
  }
}
export default new PaymentService()
