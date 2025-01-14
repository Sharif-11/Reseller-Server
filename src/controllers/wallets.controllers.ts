import { NextFunction, Request, Response } from 'express'
import WalletService from '../services/wallet.services'

class WalletController {
  /**
   * Add a new wallet for a user
   */
  async addWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      console.log({ userId })
      const { walletName, walletPhoneNo } = req.body
      const newWallet = await WalletService.addWallet({
        userId: userId!,
        walletName,
        walletPhoneNo,
      })
      res.status(201).json({
        statusCode: 201,
        message: 'Wallet successfully created',
        success: true,
        data: newWallet,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get all wallets of a specific user
   */
  async getWallets(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      const wallets = await WalletService.getWallets(userId!)
      res.status(200).json({
        statusCode: 200,
        message: 'Wallets successfully retrieved',
        success: true,
        data: wallets,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new WalletController()
