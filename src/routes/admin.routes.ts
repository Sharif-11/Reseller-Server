import { Router } from 'express'
import authControllers from '../controllers/auth.controllers'
import { isAuthenticated, verifyAdmin } from '../middlewares/auth.middlewares'
import productRouter from './adminProduct.routes'

const adminRouter = Router()
adminRouter.use(isAuthenticated, verifyAdmin)
adminRouter.use('/products', productRouter)
adminRouter.patch('/unlock-user', authControllers.unlockUser)
export default adminRouter
