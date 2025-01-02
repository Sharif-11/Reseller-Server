import { Router } from 'express'
import { isAuthenticated, verifySeller } from '../middlewares/auth.middlewares'
import sellerProductsRouter from './sellerProducts.route'
const sellerRouter = Router()
sellerRouter.use(isAuthenticated, verifySeller)
sellerRouter.use('/products', sellerProductsRouter)
export default sellerRouter
