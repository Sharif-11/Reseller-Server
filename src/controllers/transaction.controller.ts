import { NextFunction, Request, Response } from 'express'
import transactionServices from '../services/transaction.services'
import { User } from '@prisma/client'

// class TransactionController {
//   /**
//    * Add deposit to user's account
//    */
//   async addDeposit(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { userId } = req.params
//       console.log({ userId })
//       const { amount, paymentMethod, transactionId, paymentPhoneNo } = req.body
//       const transaction = await transactionServices.addDeposit({
//         amount,
//         userId,
//         paymentMethod,
//         transactionId,
//         paymentPhoneNo,
//       })
//       res.status(201).json({
//         statusCode: 201,
//         message: 'অ্যাকাউন্টে সফলভাবে ব্যালেন্স যোগ করা হয়েছে',
//         success: true,
//         data: transaction,
//       })
//     } catch (error) {
//       next(error)
//     }
//   }

//   /**
//    * Withdraw balance from user's account
//    */
//   async withdrawBalance(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { amount, transactionId, paymentPhoneNo, paymentMethod, remarks } =
//         req.body
//       const { userId } = req.params
//       const transaction = await transactionServices.withdrawBalance({
//         amount,
//         userId,
//         transactionId,
//         paymentPhoneNo,
//         paymentMethod,
//         remarks,
//       })
//       res.status(200).json({
//         statusCode: 200,
//         message: 'টাকা সফলভাবে তুলে নেওয়া হয়েছে',
//         success: true,
//         data: transaction,
//       })
//     } catch (error) {
//       next(error)
//     }
//   }
// }

// export default new TransactionController()

class TransactionController {
    /**
     * Add deposit to user's account
     */
   async getTransactionOfUser(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const  userId  = req.user?.userId as string
            const {page,pageSize} = req.query
            const transactions = await transactionServices.getTransactionOfUser(
               {
                userId,
                page: Number(page) || 1,
                pageSize: Number(pageSize) || 10
               }
            )
            res.status(200).json({
                statusCode: 200,
                message: 'Transactions fetched successfully',
                success: true,
                data: transactions,
            })
        } catch (error) {
            next(error)
        }
    }
async getAllTransactionForAdmin(
        req: Request,   
        res: Response,
        next: NextFunction
    ) {
        try {
            const {page,pageSize,phoneNo} = req.query
            const transactions = await transactionServices.getAllTransactionForAdmin(
                {   phoneNo:phoneNo as string,
                    page: Number(page) || 1,
                    pageSize: Number(pageSize) || 10
                }
            )
            res.status(200).json({
                statusCode: 200,
                message: 'Transactions fetched successfully',
                success: true,
                data: transactions,
            })
        } catch (error) {
            next(error)
        }
    }
}
export default new TransactionController()
