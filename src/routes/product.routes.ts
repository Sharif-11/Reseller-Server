import { Router } from 'express'
import productController from '../controllers/product.controller'

const productRouter = Router()
productRouter.get('/test', (req, res) => {
  res.send('Hello')
})
productRouter.post('/', productController.createProduct)
productRouter.patch('/:productId', productController.updateProduct)
productRouter.post('/:productId/add-images', productController.addImages)
productRouter.post('/:productId/publish', productController.publishProduct)
productRouter.post('/:productId/add-info', productController.addProductMeta)
productRouter.patch('/:productId/add-info', productController.updateProductMeta)
productRouter.delete('/:productId/add-review', productController.addReview)
export default productRouter
