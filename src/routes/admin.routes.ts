import { Router } from 'express'
import authControllers from '../controllers/auth.controllers'
import transactionController from '../controllers/transaction.controller'
import { isAuthenticated, verifyAdmin } from '../middlewares/auth.middlewares'
import adminOrdersRoutes from './adminOrders.routes'
import productRouter from './adminProduct.routes'
import adminWalletRouter from './adminWallet.routes'
import adminWithdrawRouter from './adminWithdraw.routes'
import commissionRoutes from './commissions.routes'
import { adminPaymentRoutes } from './payment.routes'
// import transactionRouters from './transaction.routes'

const adminRouter = Router()
adminRouter.use(isAuthenticated, verifyAdmin)
adminRouter.use('/products', productRouter)
// adminRouter.use('/transactions', transactionRouters)
adminRouter.use('/withdraw', adminWithdrawRouter)
adminRouter.use('/orders', adminOrdersRoutes)
adminRouter.use('/wallets', adminWalletRouter)
adminRouter.get(
  '/transactions',
  transactionController.getAllTransactionForAdmin
)
adminRouter.use('/commissions', commissionRoutes)
adminRouter.use('/payments', adminPaymentRoutes)
adminRouter.patch('/unlock-user', authControllers.unlockUser)
export default adminRouter
