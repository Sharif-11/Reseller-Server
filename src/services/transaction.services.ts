import { Prisma } from '@prisma/client'
import Decimal from 'decimal.js'
import ApiError from '../utils/ApiError'
import SmsServices from './sms.services'

class TransactionService {
  async checkExistingTransactionId(
    tx: Prisma.TransactionClient,
    transactionId: string
  ) {
    const existingTransaction = await tx.transaction.findFirst({
      where: { transactionId },
    })
    if (existingTransaction) {
      throw new ApiError(400, 'Transaction ID already exists')
    }
  }
  /**
   * Adds a deposit to the user's account.
   *
   * @param {Object} params - The parameters for the deposit.
   * @param {number} params.amount - The amount to be deposited. This value cannot be negative.
   * @param {string} params.userId - The ID of the user making the deposit.
   * @param {string} params.paymentMethod - The method of payment used for the deposit.
   * @param {string} params.transactionId - The transaction ID associated with the deposit.
   * @param {string} params.paymentPhoneNo - The phone number used for the payment.
   * @returns {Promise<Object>} The transaction object created.
   * @throws {ApiError} If the amount is negative, the user does not exist, or any other error occurs during the transaction.
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
    await this.checkExistingTransactionId(tx, transactionId)

    const decimalAmount = new Decimal(amount)
    if (decimalAmount.isNegative()) {
      throw new ApiError(400, 'Amount can not be negative')
    }
    // check transactionId is unique
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

    // Use optimistic locking by verifying version
    const newBalance = new Decimal(balance).plus(decimalAmount)

    const updatedUser = await tx.user.updateMany({
      where: { userId, version: userVersion },
      data: {
        balance: newBalance.toFixed(2),
        isLocked: newBalance.isNegative(),
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
        type: 'Credit',
        reason: 'Deposit',
      },
    })

    await SmsServices.sendMessage(
      userPhoneNo,
      `${decimalAmount.toFixed(
        2
      )} টাকা আপনার ব্যালেন্সে যোগ করা হয়েছে। tnxId: ${
        transaction.transactionId
      }`
    )
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
    paymentPhoneNo: string
    paymentMethod: string
    remarks?: string
  }) {
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

    await SmsServices.sendMessage(
      userPhoneNo,
      `আপনার অ্যাকাউন্ট থেকে সফলভাবে ${decimalAmount.toFixed(
        2
      )} টাকা কাটা হয়েছে। tnxId: ${transaction.transactionId}`
    )
    return transaction
  }

  async addSellCommision({
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
      throw new ApiError(400, 'Amount can not be negative')
    }

    const user = await tx.user.findUnique({
      where: { userId },
      select: { balance: true, version: true, phoneNo: true, name: true },
    })

    if (!user) {
      throw new ApiError(404, 'ব্যবহারকারী পাওয়া যায়নি')
    }

    const { phoneNo: userPhoneNo, name: userName, version: userVersion } = user

    // Add the commission to the user's balance
    const newBalance = new Decimal(user.balance).plus(decimalAmount)

    const updatedUser = await tx.user.updateMany({
      where: { userId, version: userVersion },
      data: {
        balance: newBalance.toFixed(2),
        isLocked: newBalance.isNegative(),
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
        type: 'Credit',
        reason: 'Sell Commission',
      },
    })

    await SmsServices.sendMessage(
      userPhoneNo,
      `আপনার অ্যাকাউন্টে বিক্রয় কমিশন হিসেবে ${decimalAmount.toFixed(
        2
      )} টাকা যোগ করা হয়েছে। tnxId: ${transaction.transactionId}`
    )
    return transaction
  }

  async addTeamCommision({
    tx,
    amount,
    userId,
    reference,
    referralLevel,
  }: {
    tx: Prisma.TransactionClient
    amount: number
    userId: string
    reference: string
    referralLevel: number
  }) {
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

    const { phoneNo: userPhoneNo, name: userName, version: userVersion } = user

    // Add the commission to the user's balance
    const newBalance = new Decimal(user.balance).plus(decimalAmount)

    const updatedUser = await tx.user.updateMany({
      where: { userId, version: userVersion },
      data: {
        balance: newBalance.toFixed(2),
        isLocked: newBalance.isNegative(),
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
        type: 'Credit',
        reason: 'Team Commission',
        reference,
        referralLevel,
      },
    })

    await SmsServices.sendMessage(
      userPhoneNo,
      `আপনার রেফারেল এর একজন ব্যবহারকারী সফলভাবে একটি পণ্য ডেলিভারি করেছেন। 
      আপনার অ্যাকাউন্টে টিম কমিশন হিসেবে ${decimalAmount.toFixed(
        2
      )} টাকা যোগ করা হয়েছে। tnxId: ${transaction.transactionId}`
    )
    return transaction
  }
  async deductDeliveryCharge({
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
        type: 'Debit',
        reason: 'Delivery Charge deduction due to returned product',
        remarks,
      },
    })
    await SmsServices.sendMessage(
      userPhoneNo,
      `আপনার অর্ডার করা পণ্যটি ফেরত দেওয়া হয়েছে। ডেলিভারি চার্জ হিসেবে আপনার অ্যাকাউন্ট থেকে ${decimalAmount.toFixed(
        2
      )} টাকা কাটা হয়েছে। tnxId: ${transaction.transactionId}`
    )
  }
  async deductSmsChargeForForgotPassword({
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
        type: 'Debit',
        reason: 'SMS Charge deduction for forgot password',
        remarks,
      },
    })

    await SmsServices.sendMessage(
      userPhoneNo,
      `আপনার পাসওয়ার্ড পুনরুদ্ধারের জন্য এসএমএস চার্জ হিসেবে আপনার অ্যাকাউন্ট থেকে ${decimalAmount.toFixed(
        2
      )} টাকা কাটা হয়েছে। tnxId: ${transaction.transactionId}`
    )
  }
}
export default new TransactionService()
