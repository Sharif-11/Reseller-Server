import { Router } from 'express'
import authControllers from '../controllers/auth.controllers'
import commissionController from '../controllers/commission.controller'
import { isAuthenticated, verifyAdmin } from '../middlewares/auth.middlewares'
import productRouter from './adminProduct.routes'
import adminWithdrawRouter from './adminWithdraw.routes'
import transactionController from '../controllers/transaction.controller'
import adminWalletRouter from './adminWallet.routes'
import commissionRoutes from './commissions.routes'
// import transactionRouters from './transaction.routes'

const adminRouter = Router()
adminRouter.use(isAuthenticated, verifyAdmin)
adminRouter.use('/products', productRouter)
// adminRouter.use('/transactions', transactionRouters)
adminRouter.use('/withdraw', adminWithdrawRouter)
adminRouter.use('/wallets',adminWalletRouter)
adminRouter.get('/transactions', transactionController.getAllTransactionForAdmin)
adminRouter.use('/commissions', commissionRoutes)
adminRouter.patch('/unlock-user', authControllers.unlockUser)
export default adminRouter
