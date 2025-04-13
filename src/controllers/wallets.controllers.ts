import { NextFunction, Request, Response } from 'express'
import WalletService from '../services/wallet.services'

class WalletController {
  async addAdminWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId
      const { walletName, walletPhoneNo } = req.body
      const newWallet = await WalletService.addAdminWallet({
        userId: userId!,
        walletName,
        walletPhoneNo,
      })
      res.status(201).json({
        statusCode: 201,
        message: 'ওয়ালেট সফলভাবে তৈরি করা হয়েছে',
        success: true,
        data: newWallet,
      })
    }
    catch (error) {
      next(error)
    }
  }
  async deleteAdminWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const walletId = Number(req.params.walletId)
      const result = await WalletService.deleteAdminWallet(walletId)
      res.status(200).json({
        statusCode: 200,
        message: 'ওয়ালেট সফলভাবে মুছে ফেলা হয়েছে',
        success: true,
        data: result,
      })
    }
    catch (error) {
      next(error)
    }
  }
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
        message: 'ওয়ালেট সফলভাবে তৈরি করা হয়েছে',
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
  async getAdminWalletsForUser(req: Request, res: Response, next: NextFunction) { 
    try {
      const wallets = await WalletService.getAdminWalletsForUser()
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
