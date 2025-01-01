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
        productId,
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
        images
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

  /**
   * Remove some quantities from a product
   */
  async removeQuantities(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const { quantity } = req.body
      const updatedProduct = await productServices.removeProductQuantity(
        Number(productId),
        quantity
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

  /**
   * Add product meta information
   */
  async addProductMeta(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params
      const meta = req.body
      const updatedProduct = await productServices.addProductMeta(
        +productId,
        meta
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
      const meta = req.body
      const updatedProduct = await productServices.updateProductMeta(
        +productId,
        meta
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
}

export default new ProductController()
