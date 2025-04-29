import { Prisma } from '@prisma/client'
import { HttpStatusCode } from 'axios'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import transactionServices from './transaction.services'
import userServices from './user.services'
import walletServices from './wallet.services'

class PaymentService {
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
    const existingTransaction = await prisma.payment.findUnique({
      where: { transactionId },
    })
    if (existingTransaction) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Transaction ID already exists'
      )
    }
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
      where: { paymentId },
    })
    if (!existingPayment) {
      throw new ApiError(HttpStatusCode.NotFound, 'Payment request not found')
    }
    if (existingPayment.paymentStatus !== 'pending') {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Only pending payment requests can be verified'
      )
    }
    if (transactionId !== existingPayment.transactionId) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        'Transaction ID does not match the existing payment request'
      )
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
