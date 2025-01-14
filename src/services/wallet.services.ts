import config from '../config'
import ApiError from '../utils/ApiError'
import prisma from '../utils/prisma'
import userServices from './user.services'
import walletContactServices from './walletContact.services'

class WalletService {
  // create a add wallet method to add a new wallet
  async addWallet({
    userId,
    walletName,
    walletPhoneNo,
  }: {
    userId: string
    walletName: string
    walletPhoneNo: string
  }) {
    const user = await userServices.getUserByUserId(String(userId))
    if (!user) {
      throw new ApiError(404, 'User not found')
    }
    // find if is there any wallet with the same phone number
    const wallet = await prisma.wallet.findUnique({
      where: { walletName_walletPhoneNo: { walletName, walletPhoneNo } },
    })
    if (wallet) {
      throw new ApiError(400, 'Wallet with this phone number already exists')
    }

    // user can't create more than 3 walets
    const wallets = await prisma.wallet.findMany({
      where: { userId: user.userId },
    })
    if (wallets.length >= config.maximumWallets) {
      throw new ApiError(
        400,
        `User can not create more than ${config.maximumWallets} wallets`
      )
    }
    if (walletPhoneNo !== user.phoneNo) {
      await walletContactServices.checkWalletContact(walletPhoneNo)
    }
    // create a new wallet
    const newWallet = await prisma.wallet.create({
      data: {
        walletName,
        walletPhoneNo,
        userId: user.userId,
        userName: user.name,
        userPhoneNo: user.phoneNo,
      },
    })
    return newWallet
  }
  // create a method to find all wallets of a user
  async getWallets(userId: string) {
    const user = await userServices.getUserByUserId(userId)
    if (!user) {
      throw new ApiError(404, 'User not found')
    }
    const wallets = await prisma.wallet.findMany({
      where: { userId: user.userId },
    })
    return wallets
  }
}
export default new WalletService()
