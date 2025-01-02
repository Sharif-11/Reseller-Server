import { Router } from 'express'
import productController from '../controllers/product.controller'

const userProductsRouter = Router()
userProductsRouter.get('/', productController.getAllProducts)
userProductsRouter.get('/:productId', productController.getProduct)
export default userProductsRouter
