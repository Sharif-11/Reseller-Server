import { Router } from 'express'
import productRouter from './product.routes'

const adminRouter = Router()
adminRouter.use('/products', productRouter)
export default adminRouter
