import { Router } from 'express';
import walletsControllers from '../controllers/wallets.controllers';
const adminWalletRouter=Router()
adminWalletRouter.post('/',walletsControllers.addAdminWallet)
adminWalletRouter.get('/',walletsControllers.getWallets)
adminWalletRouter.delete('/:walletId',walletsControllers.deleteAdminWallet)
export default adminWalletRouter