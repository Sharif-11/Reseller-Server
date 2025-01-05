import { Router } from 'express'
import authControllers from '../controllers/auth.controllers'
import commissionController from '../controllers/commission.controller'
import { isAuthenticated, verifyAdmin } from '../middlewares/auth.middlewares'
import productRouter from './adminProduct.routes'
import transactionRouters from './transaction.routes'

const adminRouter = Router()
adminRouter.use(isAuthenticated, verifyAdmin)
adminRouter.use('/products', productRouter)
adminRouter.use('/transactions', transactionRouters)
adminRouter.post('/commissions', commissionController.createCommissions)
adminRouter.get('/commissions', commissionController.getFullCommissionTable)
adminRouter.put('/commissions', commissionController.updateCommissionTable)

adminRouter.get(
  '/commissions/:price',
  commissionController.getCommissionsByPrice
)
adminRouter.patch('/unlock-user', authControllers.unlockUser)
export default adminRouter
