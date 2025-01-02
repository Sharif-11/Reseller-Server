import { Router } from 'express'
import productController from '../controllers/product.controller'
const sellerProductsRouter = Router()
sellerProductsRouter.get('/', productController.getAllProducts)
sellerProductsRouter.get('/:productId', productController.getProduct)
export default sellerProductsRouter
