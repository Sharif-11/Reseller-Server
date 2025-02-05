import { Router } from 'express'
import authControllers from '../controllers/auth.controllers'
import { isAuthenticated, verifySeller } from '../middlewares/auth.middlewares'
import sellerProductsRouter from './sellerProducts.route'
import sellerWithdrawRouter from './sellerWithdraw.routes'
import walletRouter from './wallet.routes'
const sellerRouter = Router()
sellerRouter.use(isAuthenticated, verifySeller)
sellerRouter.post('/add-referral', authControllers.addReferralCode)
sellerRouter.use('/products', sellerProductsRouter)
sellerRouter.use('/wallets', walletRouter)
sellerRouter.use('/withdraw', sellerWithdrawRouter)

export default sellerRouter
