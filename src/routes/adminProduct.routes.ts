import { Router } from 'express'
import productController from '../controllers/product.controller'

const productRouter = Router()

productRouter.post('/', productController.createProduct)
productRouter.get('/', productController.getAllProducts)
productRouter.get('/:productId', productController.getProduct)
productRouter.patch('/:productId', productController.updateProduct)
productRouter.post('/:productId/images', productController.addImages)
productRouter.post('/:productId/publish', productController.publishProduct)
productRouter.post('/:productId/info', productController.addProductMeta)
productRouter.patch('/:productId/info', productController.updateProductMeta)
productRouter.post('/:productId/review', productController.addReview)
productRouter.delete(
  '/:productId/images/:imageId',
  productController.deleteImage
)
export default productRouter
