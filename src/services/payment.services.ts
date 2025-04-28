import { Prisma } from '@prisma/client'
import { HttpStatusCode } from 'axios'
import ApiError from '../utils/ApiError'

class PaymentService {
  async createDuePaymentRequest({
    tx,
    adminWalletId,
    amount,
    transactionId,
    sellerWalletName,
    sellerWalletPhoneNo,
    sellerName,
    sellerPhoneNo,
    adminWalletName,
    adminWalletPhoneNo,
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
  }) {
    const duePaymentRequest = await tx.payment.create({
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
  }) {
    const orderPaymentRequest = await tx.payment.create({
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
        orderId,
        sender: 'Seller',
        paymentType: 'OrderPayment',
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
    adminWalletId,
    adminWalletName,
    adminWalletPhoneNo,
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
  }) {
    const withdrawPaymentRequest = await tx.payment.create({
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
        sender: 'Admin',
        paymentType: 'WithdrawPayment',
        paymentStatus: 'verified',
      },
    })
    return withdrawPaymentRequest
  }
  async verifyPaymentRequest({
    tx,
    paymentId,
    amount,
    transactionId,
  }: {
    tx: Prisma.TransactionClient
    paymentId: number
    transactionId: string
    amount: number
  }) {
    const existingPayment = await tx.payment.findUnique({
      where: { paymentId },
    })
    if (!existingPayment) {
      throw new ApiError(HttpStatusCode.BadRequest, 'Payment request not found')
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
    const updatedPayment = await tx.payment.update({
      where: { paymentId },
      data: {
        paymentStatus: 'verified',
        amount,
      },
    })
    return updatedPayment
  }
  async rejectPaymentRequest({
    tx,
    paymentId,
  }: {
    tx: Prisma.TransactionClient
    paymentId: number
  }) {
    const existingPayment = await tx.payment.findUnique({
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
    return await tx.payment.update({
      where: { paymentId },
      data: {
        paymentStatus: 'rejected',
        transactionId: null,
      },
    })
  }
}
export default new PaymentService()
