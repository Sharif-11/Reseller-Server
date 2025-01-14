import { Router } from 'express'
import { isAuthenticated, verifySeller } from '../middlewares/auth.middlewares'
import sellerProductsRouter from './sellerProducts.route'
import walletRouter from './wallet.routes'
const sellerRouter = Router()
sellerRouter.use(isAuthenticated, verifySeller)
sellerRouter.use('/products', sellerProductsRouter)
sellerRouter.use('/wallets', walletRouter)
export default sellerRouter
