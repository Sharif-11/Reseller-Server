import { Router } from 'express'
import authControllers from '../controllers/auth.controllers'
import orderControllers from '../controllers/order.controllers'
import transactionController from '../controllers/transaction.controller'
import { isAuthenticated, verifySeller } from '../middlewares/auth.middlewares'
import { sellerCommissionRoutes } from './commissions.routes'
import { sellerPaymentRoutes } from './payment.routes'
import SellerOrderRoutes from './sellerOrder.routes'
import sellerProductsRouter from './sellerProducts.route'
import sellerWithdrawRouter from './sellerWithdraw.routes'
import walletRouter from './wallet.routes'
const sellerRouter = Router()
sellerRouter.use(isAuthenticated, verifySeller)
sellerRouter.post('/add-referral', authControllers.addReferralCode)
sellerRouter.use('/products', sellerProductsRouter)
sellerRouter.use('/wallets', walletRouter)
sellerRouter.use('/withdraw', sellerWithdrawRouter)
sellerRouter.use('/orders', SellerOrderRoutes)
sellerRouter.use('/payments', sellerPaymentRoutes)
sellerRouter.get('/dashboard', orderControllers.getSellerDashboardStats)
sellerRouter.use('/commissions', sellerCommissionRoutes)
sellerRouter.get('/transactions', transactionController.getTransactionOfUser)

export default sellerRouter
