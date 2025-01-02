import { Router } from 'express'
import { isAuthenticated, verifyAdmin } from '../middlewares/auth.middlewares'
import productRouter from './adminProduct.routes'

const adminRouter = Router()
adminRouter.use(isAuthenticated, verifyAdmin)
adminRouter.use('/products', productRouter)
export default adminRouter
