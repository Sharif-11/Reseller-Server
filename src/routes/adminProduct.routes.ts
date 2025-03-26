import { Router } from 'express'
import productController from '../controllers/product.controller'
import validateRequest from '../middlewares/validation.middleware'
import {
  addProductMetaValidator,
  addReviewValidator,
  deleteImageValidator,
  productIdValidatorParams,
  updateProductMetaValidator,
  updateProductValidator,
} from '../Validators/product.validator'

const productRouter = Router()

productRouter.post('/', productController.createProduct)
productRouter.get('/', productController.getAllProducts)
productRouter.get(
  '/:productId',
  productIdValidatorParams,
  validateRequest,
  productController.getProduct,
)
productRouter.patch(
  '/:productId',
  updateProductValidator,
  validateRequest,
  productController.updateProduct,
)
productRouter.post(
  '/:productId/images',
  // addImagesValidator,
  // validateRequest,
  productController.addImages,
)
productRouter.post(
  '/:productId/publish',
  productIdValidatorParams,
  validateRequest,
  productController.publishProduct,
)
productRouter.put(
  '/:productId/meta',
  // addProductMetaValidator,
  // validateRequest,
  productController.createOrUpdateProductMeta,
)
productRouter.get(
  '/:productId/meta',
  // productIdValidatorParams,
  // validateRequest,
  productController.getProductMeta,
)
productRouter.patch(
  '/:productId/info',
  updateProductMetaValidator,
  validateRequest,
  productController.updateProductMeta,
)
productRouter.post(
  '/:productId/review',
  addReviewValidator,
  validateRequest,
  productController.addReview,
)
productRouter.delete(
  '/:productId/images/:imageId',
  deleteImageValidator,
  validateRequest,
  productController.deleteImage,
)
export default productRouter
