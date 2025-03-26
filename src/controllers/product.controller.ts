import { NextFunction, Request, Response } from 'express'
import productServices from '../services/product.services'
import userServices from '../services/user.services'

class ProductController {
  /**
   * Create a new product
   */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productData = req.body

      const newProduct = await productServices.createProduct(productData)
      res.status(201).json({
        statusCode: 201,
        message: 'পণ্য সফলভাবে তৈরি হয়েছে',
        success: true,
        data: newProduct,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update product details
   */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const updates = req.body
      const updatedProduct = await productServices.updateProduct({
        productId: +productId,
        ...updates,
      })
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্য সফলভাবে আপডেট করা হয়েছে',
        success: true,
        data: updatedProduct,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Add images for a product
   */
  async addImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const { images } = req.body // Assume `images` is an array of URLs or image IDs
      const updatedProduct = await productServices.addProductImages(
        Number(productId),
        images,
      )
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্যের ছবি সফলভাবে যোগ করা হয়েছে',
        success: true,
        data: updatedProduct,
      })
    } catch (error) {
      next(error)
    }
  }
  async getProductImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const images = await productServices.getProductImages(+productId)
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্যের ছবি সফলভাবে পেয়েছেন',
        success: true,
        data: images,
      })
    }
    catch (error) {
      next(error)
    }
  }

  /**
   * Remove some quantities from a product
   */
  async removeQuantities(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const { quantity } = req.body
      const updatedProduct = await productServices.removeProductQuantity(
        Number(productId),
        quantity,
      )
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্যের পরিমাণ সফলভাবে কমানো হয়েছে',
        success: true,
        data: updatedProduct,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Publish a product
   */
  async publishProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const publishedProduct = await productServices.publishProduct(+productId)
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্য সফলভাবে প্রকাশিত হয়েছে',
        success: true,
        data: publishedProduct,
      })
    } catch (error) {
      next(error)
    }
  }

  async unpublishProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const unpublishedProduct = await productServices.unpublishProduct(
        +productId,
      )
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্য সফলভাবে অপ্রকাশিত হয়েছে',
        success: true,
        data: unpublishedProduct,
      })
    }
    catch (error) {
      next(error)
    }
  }

  /**
   * Add product meta information
   */
  async addProductMeta(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const { meta } = req.body
      const updatedProduct = await productServices.addProductMeta(
        +productId,
        meta,
      )
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্যের মেটা তথ্য সফলভাবে যোগ করা হয়েছে',
        success: true,
        data: updatedProduct,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update product meta information
   */
  async updateProductMeta(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const { meta } = req.body
      const updatedProduct = await productServices.updateProductMeta(
        +productId,
        meta,
      )
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্যের মেটা তথ্য সফলভাবে আপডেট করা হয়েছে',
        success: true,
        data: updatedProduct,
      })
    } catch (error) {
      next(error)
    }
  }
  async createOrUpdateProductMeta(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { productId } = req.params
      const { meta } = req.body
      const updatedProduct = await productServices.createOrUpdateProductMeta(
        +productId,
        meta,
      )
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্যের মেটা তথ্য সফলভাবে যোগ করা হয়েছে',
        success: true,
        data: updatedProduct,
      })
    }
    catch (error) {
      next(error)
    }
  }
  async getProductMeta(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const productMeta = await productServices.getMeta(+productId)
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্যের মেটা তথ্য সফলভাবে পেয়েছেন',
        success: true,
        data: productMeta,
      })
    }
    catch (error) {
      next(error)
    }
  }


  /**
   * Add product review
   */
  async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const userId = req.user?.userId
      //get user info
      const {
        userId: sellerId,
        name: sellerName,
        phoneNo: sellerPhone,
      } = await userServices.getUserByUserId(userId as string)

      const { rating, comment } = req.body
      const updatedProduct = await productServices.addProductReview({
        sellerId,
        sellerName,
        sellerPhone,
        rating,
        review: comment,
        productId: +productId,
      })
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্যের রিভিউ সফলভাবে যোগ করা হয়েছে',
        success: true,
        data: updatedProduct,
      })
    } catch (error) {
      next(error)
    }
  }
  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, imageId } = req.params
      const updatedProduct = await productServices.deleteImage(
        +productId,
        +imageId,
      )
      res.status(200).json({
        statusCode: 200,
        message: 'ছবি সফলভাবে মুছে ফেলা হয়েছে',
        success: true,
        data: updatedProduct,
      })
    } catch (error) {
      next(error)
    }
  }
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, category, minPrice, maxPrice, page, pageSize } = req.query

      // Prepare filters with proper types
      const filters = {
        name: name as string | undefined,
        category: category as string | undefined,
        minPrice: minPrice ? parseInt(minPrice as string, 10) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
      }

      // Call the service
      const result = await productServices.getAllProducts(
        filters,
        req.user?.role == 'Admin' ? undefined : true,
      )

      res.status(200).json({
        statusCode: 200,
        message: 'সকল পণ্যের তালিকা',
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const role = req?.user?.role
      const product = await productServices.getProduct(+productId)
      if (!role || role == 'Seller') {
        product.stockSize = product.stockSize > 0 ? 1 : 0
      }
      res.status(200).json({
        statusCode: 200,
        message: 'পণ্য সফলভাবে পেয়েছেন',
        success: true,
        data: product,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new ProductController()
