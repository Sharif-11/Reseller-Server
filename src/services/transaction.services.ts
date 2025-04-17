import { Prisma } from '@prisma/client'
import Decimal from 'decimal.js'
import ApiError from '../utils/ApiError'
import SmsServices from './sms.services'
import prisma from '../utils/prisma'

class TransactionService {
  /**
   * ট্রানজেকশন আইডি চেক করার জন্য প্রাইভেট মেথড
   * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
   * @param transactionId - চেক করার ট্রানজেকশন আইডি
   * @throws ApiError যদি ট্রানজেকশন আইডি ইতিমধ্যে থাকে
   */
  private async checkExistingTransactionId(
    tx: Prisma.TransactionClient,
    transactionId: string
  ): Promise<void> {
    const existingTransaction = await tx.transaction.findFirst({
      where: { transactionId },
    })
    if (existingTransaction) {
      throw new ApiError(400, 'এই ট্রানজেকশন আইডি ইতিমধ্যে ব্যবহৃত হয়েছে')
    }
  }

  /**
   * লক সহ ইউজার ডেটা পাওয়ার জন্য প্রাইভেট মেথড
   * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
   * @param userId - ইউজার আইডি
   * @returns ইউজার ডেটা
   * @throws ApiError যদি ইউজার না পাওয়া যায়
   */
  private async getUserWithLock(
    tx: Prisma.TransactionClient,
    userId: string
  ): Promise<{
    phoneNo: string
    name: string
    balance: Decimal
    version: number;
    isLocked: boolean
  }> {
    // এক্সপ্লিসিট রো লকিং
    await tx.$executeRaw`SELECT * FROM "users" WHERE "userId" = ${userId} FOR UPDATE`

    const user = await tx.user.findUnique({
      where: { userId },
      select: { balance: true, version: true, phoneNo: true, name: true,isLocked:true },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

    return {
      ...user,
      balance: new Decimal(user.balance),
    }
  }

  /**
   * ইউজার ব্যালেন্স আপডেট করার প্রাইভেট মেথড
   * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
   * @param userId - ইউজার আইডি
   * @param currentVersion - বর্তমান ভার্সন
   * @param newBalance - নতুন ব্যালেন্স
   * @param isLocked - লক করা হবে কিনা
   * @throws ApiError যদি আপডেট ব্যর্থ হয়
   */
  private async updateUserBalance(
    tx: Prisma.TransactionClient,
    userId: string,
    currentVersion: number,
    newBalance: Decimal,
    isLocked: boolean = false
  ): Promise<void> {
    const updatedUser = await tx.user.updateMany({
      where: { 
        userId,
        version: currentVersion 
      },
      data: {
        balance: newBalance.toFixed(2),
        isLocked,
        version: { increment: 1 },
      },
    })

    if (updatedUser.count === 0) {
      throw new ApiError(409, 'ব্যবহারকারী আপডেট ব্যর্থ হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন')
    }
  }

  /**
   * ট্রানজেকশন রেকর্ড তৈরি করার প্রাইভেট মেথড
   * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
   * @param params - ট্রানজেকশন প্যারামিটার
   * @returns তৈরি করা ট্রানজেকশন
   */
  private async createTransactionRecord(
    tx: Prisma.TransactionClient,
    params: {
      amount: Decimal
      userId: string
      userPhoneNo: string
      userName: string
      type: 'Credit' | 'Debit'
      reason: string
      paymentMethod?: string
      transactionId?: string
      paymentPhoneNo?: string
      remarks?: string
      reference?: string
      referralLevel?: number
    }
  ) {
    return await tx.transaction.create({
      data: {
        amount: params.amount.toFixed(2),
        userId: params.userId,
        userPhoneNo: params.userPhoneNo,
        userName: params.userName,
        type: params.type,
        reason: params.reason,
        paymentMethod: params.paymentMethod,
        transactionId: params.transactionId,
        paymentPhoneNo: params.paymentPhoneNo,
        remarks: params.remarks,
        reference: params.reference,
        referralLevel: params.referralLevel,
      },
    })
  }

  /**
   * ইউজারের ট্রানজেকশন ইতিহাস পাওয়ার মেথড
   * @param userId - ইউজার আইডি
   * @param page - পেজ নম্বর
   * @param pageSize - প্রতি পেজে আইটেম সংখ্যা
   * @returns ট্রানজেকশন লিস্ট এবং পেজিনেশন ডেটা
   */
  async getTransactionOfUser({
    userId,
    page = 1,
    pageSize = 10,
  }: {
    userId: string
    page?: number
    pageSize?: number
  }) {
    const [transactionList, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.transaction.count({ where: { userId } }),
    ])

    return {
      transactionList,
      totalTransactions: total,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  /**
   * অ্যাডমিনের জন্য সব ট্রানজেকশন পাওয়ার মেথড
   * @param phoneNo - ফোন নম্বর দিয়ে ফিল্টার (ঐচ্ছিক)
   * @param page - পেজ নম্বর
   * @param pageSize - প্রতি পেজে আইটেম সংখ্যা
   * @returns ট্রানজেকশন লিস্ট এবং পেজিনেশন ডেটা
   */
  async getAllTransactionForAdmin({
    phoneNo,
    page = 1,
    pageSize = 10,
  }: {
    phoneNo?: string
    page?: number
    pageSize?: number
  }) {
    const [transactionList, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userPhoneNo: phoneNo ? { contains: phoneNo } : undefined,
        },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.transaction.count({
        where: {
          userPhoneNo: phoneNo ? { contains: phoneNo } : undefined,
        },
      }),
    ])

    return {
      transactionList,
      totalTransactions: total,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  /**
   * ডিপোজিট যোগ করার মেথড
   * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
   * @param amount - যোগ করার পরিমাণ
   * @param userId - ইউজার আইডি
   * @param paymentMethod - পেমেন্ট মেথড
   * @param transactionId - ট্রানজেকশন আইডি
   * @param paymentPhoneNo - পেমেন্ট ফোন নম্বর
   * @returns তৈরি করা ট্রানজেকশন
   * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ট্রানজেকশন আইডি ইতিমধ্যে থাকে
   */
  async addDeposit({
    tx,
    amount,
    userId,
    paymentMethod,
    transactionId,
    paymentPhoneNo,
  }: {
    tx: Prisma.TransactionClient
    amount: number
    userId: string
    paymentMethod: string
    transactionId: string
    paymentPhoneNo: string
  }) {
    const decimalAmount = new Decimal(amount)
    if (decimalAmount.isNegative()) {
      throw new ApiError(400, 'পরিমাণ নেগেটিভ হতে পারবে না')
    }

    await this.checkExistingTransactionId(tx, transactionId)

    const user = await this.getUserWithLock(tx, userId)
    const newBalance = user.balance.plus(decimalAmount)

    await this.updateUserBalance(
      tx,
      userId,
      user.version,
      newBalance,
      newBalance.isNegative() ? user.isLocked : false
    )

    const transaction = await this.createTransactionRecord(tx, {
      amount: decimalAmount,
      userId,
      userPhoneNo: user.phoneNo,
      userName: user.name,
      type: 'Credit',
      reason: 'জমা',
      paymentMethod,
      transactionId,
      paymentPhoneNo,
    })

    await SmsServices.sendMessage(
      user.phoneNo,
      `আপনার অ্যাকাউন্টে ${decimalAmount.toFixed(2)} টাকা যোগ করা হয়েছে। টিএক্সআইডি: ${transaction.transactionId}`
    )

    return transaction
  }

  /**
   * বকেয়া পরিশোধের মেথড
   * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
   * @param amount - পরিশোধের পরিমাণ
   * @param userId - ইউজার আইডি
   * @param transactionId - ট্রানজেকশন আইডি
   * @param paymentPhoneNo - পেমেন্ট ফোন নম্বর (ঐচ্ছিক)
   * @param paymentMethod - পেমেন্ট মেথড
   * @returns তৈরি করা ট্রানজেকশন
   * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ট্রানজেকশন আইডি ইতিমধ্যে থাকে
   */
  async compensateDue({
    tx,
    amount,
    userId,
    transactionId,
    paymentPhoneNo,
    paymentMethod,
  }: {
    tx: Prisma.TransactionClient
    amount: number
    userId: string
    transactionId: string
    paymentPhoneNo?: string
    paymentMethod: string
  }) {
    const decimalAmount = new Decimal(amount)
    if (decimalAmount.isNegative()) {
      throw new ApiError(400, 'পরিমাণ নেগেটিভ হতে পারবে না')
    }

    await this.checkExistingTransactionId(tx, transactionId)

    const user = await this.getUserWithLock(tx, userId)
    const newBalance = user.balance.plus(decimalAmount)

    await this.updateUserBalance(
      tx,
      userId,
      user.version,
      newBalance,
      newBalance.isNegative() ? user.isLocked : false
    )

    const transaction = await this.createTransactionRecord(tx, {
      amount: decimalAmount,
      userId,
      userPhoneNo: user.phoneNo,
      userName: user.name,
      type: 'Credit',
      reason: 'বকেয়া পরিশোধ',
      paymentMethod,
      transactionId,
      paymentPhoneNo,
    })

    return { transaction }
  }

  /**
   * অর্ডার অ্যাপ্রুভালের জন্য ডেলিভারি চার্জ কাটার মেথড
   * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
   * @param amount - কাটার পরিমাণ
   * @param userId - ইউজার আইডি
   * @param transactionId - ট্রানজেকশন আইডি
   * @returns তৈরি করা ট্রানজেকশন
   * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ব্যালেন্স কম থাকে
   */
  async deductDeliveryChargeForOrderApproval({
    tx,
    amount,
    userId,
  
  }: {
    tx: Prisma.TransactionClient
    amount: number
    userId: string
  }) {
    const decimalAmount = new Decimal(amount)
    if (decimalAmount.isNegative()) {
      throw new ApiError(400, 'পরিমাণ নেগেটিভ হতে পারবে না')
    }

    const user = await this.getUserWithLock(tx, userId)
    const newBalance = user.balance.minus(decimalAmount)
    await this.updateUserBalance(tx, userId, user.version, newBalance)

    const transaction = await this.createTransactionRecord(tx, {
      amount: decimalAmount,
      userId,
      userPhoneNo: user.phoneNo,
      userName: user.name,
      type: 'Debit',
      reason: 'ডেলিভারি চার্জ কর্তন',
      remarks: 'অর্ডার অনুমোদনের জন্য ডেলিভারি চার্জ কাটা হয়েছে',
    })

    return { transaction }
  }

  /**
   * অর্ডার ক্যান্সেলেশনের জন্য রিফান্ড করার মেথড
   * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
   * @param amount - রিফান্ডের পরিমাণ
   * @param userId - ইউজার আইডি
   * @param transactionId - ট্রানজেকশন আইডি
   * @param paymentPhoneNo - পেমেন্ট ফোন নম্বর (ঐচ্ছিক)
   * @param paymentMethod - পেমেন্ট মেথড
   * @param remarks - রিমার্কস (ঐচ্ছিক)
   * @returns তৈরি করা ট্রানজেকশন
   * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ট্রানজেকশন আইডি ইতিমধ্যে থাকে
   */
  async refundOrderCancellation({
    tx,
    amount,
    userId,
    remarks,
  }: {
    tx: Prisma.TransactionClient
    amount: number
    userId: string
    remarks?: string
  }) {
    const decimalAmount = new Decimal(amount)
    if (decimalAmount.isNegative()) {
      throw new ApiError(400, 'পরিমাণ নেগেটিভ হতে পারবে না')
    }

    const user = await this.getUserWithLock(tx, userId)
    const newBalance = user.balance.plus(decimalAmount)

    await this.updateUserBalance(
      tx,
      userId,
      user.version,
      newBalance,
      newBalance.isNegative() ? user.isLocked : false
    )

    const transaction = await this.createTransactionRecord(tx, {
      amount: decimalAmount,
      userId,
      userPhoneNo: user.phoneNo,
      userName: user.name,
      type: 'Credit',
      reason: 'অর্ডার বাতিলের জন্য রিফান্ড',
      remarks,
    })

    return transaction
  }

  /**
   * Add Seller Commission
   * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
   * @param amount - কমিশনের পরিমাণ
   * @param userId - ইউজার আইডি
   * @returns তৈরি করা ট্রানজেকশন
   * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ট্রানজেকশন আইডি ইতিমধ্যে থাকে
  
   */
  async addSellerCommission({
    tx,
    amount,
    userId,
    userPhoneNo,
    userName}
  : {
    tx: Prisma.TransactionClient
    amount: number
    userId: string
    userPhoneNo: string
    userName: string
    }) {
    const decimalAmount = new Decimal(amount);

    if (decimalAmount.isNegative()) {
      throw new ApiError(400, 'পরিমাণ নেগেটিভ হতে পারবে না')
    }

    const user = await this.getUserWithLock(tx, userId)
    const newBalance = user.balance.plus(decimalAmount)
    await this.updateUserBalance(
      tx,
      userId,
      user.version,
      newBalance,
      newBalance.isNegative() ? user.isLocked : false
    )

    const transaction = await this.createTransactionRecord(tx, {
      amount: decimalAmount,
      userId,
      userPhoneNo: userPhoneNo,
      userName: userName,
      type: 'Credit',
      reason: 'সেলস কমিশন ',
    })
    return transaction
 
  }

  /**
   * Return Delivery Charge After Order Completion
   * @param tx - Prisma ট্রানজেকশন ক্লায়েন্ট
   * @param amount - কমিশনের পরিমাণ
   * @param userId - ইউজার আইডি
   * @param userPhoneNo - ইউজার ফোন নম্বর
   * @param userName - ইউজার নাম
   * @returns তৈরি করা ট্রানজেকশন
   * @throws ApiError যদি পরিমাণ নেগেটিভ হয় বা ট্রানজেকশন আইডি ইতিমধ্যে থাকে
    */
  async returnDeliveryChargeAfterOrderCompletion({
    tx,
    amount,
    userId,
    userPhoneNo,
    userName,
  }:{
    tx: Prisma.TransactionClient
    amount: number
    userId: string
    userPhoneNo: string
    userName: string
  }){
    const decimalAmount = new Decimal(amount)

    if (decimalAmount.isNegative()) {
      throw new ApiError(400, 'পরিমাণ নেগেটিভ হতে পারবে না')
    }

    const user = await this.getUserWithLock(tx, userId)
    const newBalance = user.balance.plus(decimalAmount)
    await this.updateUserBalance(
      tx,
      userId,
      user.version,
      newBalance,
      newBalance.isNegative() ? user.isLocked : false
    )

    const transaction = await this.createTransactionRecord(tx, {
      amount: decimalAmount,
      userId,
      userPhoneNo: userPhoneNo,
      userName: userName,
      type: 'Credit',
      reason: 'ডেলিভারি চার্জ ফেরত',
    })
    return transaction

  }
  async withdrawBalance({
    tx,
    amount,
    userId,
    transactionId,
    paymentPhoneNo,
    paymentMethod,
    remarks,
  }: {
    tx: Prisma.TransactionClient
    amount: number
    userId: string
    transactionId: string
    paymentPhoneNo?: string
    paymentMethod: string
    remarks?: string
  }) {
    try {
      await this.checkExistingTransactionId(tx, transactionId)
      const decimalAmount = new Decimal(amount)
      if (decimalAmount.isNegative()) {
        throw new ApiError(400, 'Amount can not be negative')
      }

      const user = await tx.user.findUnique({
        where: { userId },
        select: { balance: true, version: true, phoneNo: true, name: true },
      })

      if (!user) {
        throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
      }

      const {
        phoneNo: userPhoneNo,
        name: userName,
        balance,
        version: userVersion,
      } = user

      // Ensure the user has enough balance
      const newBalance = new Decimal(balance).minus(decimalAmount)
      if (newBalance.isNegative()) {
        throw new ApiError(400, 'অপর্যাপ্ত ব্যালেন্স')
      }

      const updatedUser = await tx.user.updateMany({
        where: { userId, version: userVersion },
        data: {
          balance: newBalance.toFixed(2),
          version: { increment: 1 },
        },
      })

      if (updatedUser.count === 0) {
        throw new ApiError(
          409,
          'ব্যবহারকারী আপডেট করা যায়নি, অনুগ্রহ করে আবার চেষ্টা করুন'
        )
      }

      // Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount: decimalAmount.toFixed(2),
          userId,
          userPhoneNo,
          userName,
          paymentMethod,
          transactionId,
          paymentPhoneNo,
          type: 'Debit',
          reason: 'Withdraw',
          remarks,
        },
      })
      // check if transaction created successfully
      if (!transaction) {
        throw new ApiError(500, 'লেনদেন সফলভাবে সম্পন্ন হয়নি')
      }

      return transaction
    } catch (error) {
      throw new ApiError(
        500,
        (error as any)?.message || 'লেনদেন সফলভাবে সম্পন্ন হয়নি'
      )
    }
  }
  
}

export default new TransactionService()