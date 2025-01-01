import ApiError from '../utils/ApiError' // Importing your custom ApiError
import prisma from '../utils/prisma'

class ProductImageService {
  /**
   * Add multiple images for a product
   * @param productId - ID of the product
   * @param imageUrls - Array of image URLs to be added
   */
  async addImages(productId: number, imageUrls: string[]) {
    const imageEntries = imageUrls.map(url => ({
      productId,
      imageUrl: url,
    }))

    try {
      const result = await prisma.productImage.createMany({
        data: imageEntries,
      })
      return result
    } catch (error) {
      throw new ApiError(500, 'ছবি আপলোড করতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }

  /**
   * Delete a specific image of a specific product
   * @param productId - ID of the product
   * @param imageId - ID of the image to delete
   */
  async deleteImage(productId: number, imageId: number) {
    try {
      return await prisma.productImage.delete({
        where: {
          imageId,
          productId,
        },
      })
    } catch (error) {
      throw new ApiError(500, 'ছবি মুছতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }

  /**
   * Delete all images related to a product
   * @param productId - ID of the product
   */
  async deleteAllImages(productId: number) {
    try {
      return await prisma.productImage.deleteMany({
        where: {
          productId,
        },
      })
    } catch (error) {
      throw new ApiError(500, 'সব ছবি মুছতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }
}
class ProductMetaService {
  // Method to add new meta information
  async addMeta(
    productId: number,
    metaEntries: { key: string; value: string }[]
  ) {
    try {
      const newMetaData = metaEntries.map(entry => ({
        productId,
        key: entry.key,
        value: entry.value,
      }))

      await prisma.productMeta.createMany({
        data: newMetaData,
      })
    } catch (error) {
      throw new ApiError(500, 'মেটা ডেটা যোগ করতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }
}
class ProductReviewService {
  /**
   * Add a review by a seller for a product
   * @param productId - ID of the product
   * @param sellerId - ID of the seller
   * @param review - Review text for the product
   * @param rating - Rating for the product (e.g., 1 to 5)
   * @param sellerPhone - Seller's phone number
   * @param sellerName - Seller's name
   */
  async addReview(
    productId: number,
    sellerId: string,
    review: string,
    rating: number,
    sellerPhone: string,
    sellerName: string
  ) {
    if (!review || review.trim() === '') {
      throw new ApiError(400, 'রিভিউ লেখাটি খালি হতে পারে না।')
    }

    if (rating < 1 || rating > 5) {
      throw new ApiError(400, 'রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে।')
    }

    try {
      // Create a new review entry in the database
      const result = await prisma.productReview.create({
        data: {
          productId,
          sellerId,
          review,
          rating,
          sellerPhone,
          sellerName,
        },
      })

      return result
    } catch (error) {
      throw new ApiError(500, 'রিভিউ যোগ করতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }
}
// Assuming you have your custom error handler
class ProductService {
  imageService: ProductImageService
  metaService: ProductMetaService
  reviewService: ProductReviewService
  constructor() {
    this.imageService = new ProductImageService()
    this.metaService = new ProductMetaService()
    this.reviewService = new ProductReviewService()
  }
  /**
   * Create a new product
   * @param data - Object containing product details
   */
  async createProduct(data: {
    name: string
    imageUrl: string
    category: string
    basePrice: number
    stockSize: number
    suggestedMaximumPrice: number
    description: string
    location: string
    insideDeliveryCharge: number
    outsideDeliveryCharge: number
    videoUrl?: string
  }) {
    const {
      name,
      imageUrl,
      category,
      basePrice,
      stockSize,
      suggestedMaximumPrice,
      description,
      location,
      insideDeliveryCharge,
      outsideDeliveryCharge,
      videoUrl,
    } = data

    try {
      const newProduct = await prisma.product.create({
        data: {
          name,
          imageUrl,
          category,
          basePrice,
          stockSize,
          suggestedMaxPrice: suggestedMaximumPrice,
          description,
          videoUrl,
          location,
          deliveryChargeInside: insideDeliveryCharge,
          deliveryChargeOutside: outsideDeliveryCharge,
          isVerifiedProduct: false,
          published: false,
        },
      })

      return newProduct
    } catch (error) {
      console.error('Error creating product:', error)
      throw new ApiError(500, 'পণ্য তৈরি করতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }

  /**
   * Update an existing product (excluding the 'published' field)
   * @param data - Object containing updated product details
   */
  async updateProduct(data: {
    productId: number
    name: string
    imageUrl: string
    category: string
    basePrice: number
    stockSize: number
    suggestedMaximumPrice: number
    description: string
    location: string
    insideDeliveryCharge: number
    outsideDeliveryCharge: number
    videoUrl?: string
  }) {
    const {
      productId,
      name,
      imageUrl,
      category,
      basePrice,
      stockSize,
      suggestedMaximumPrice,
      description,
      location,
      insideDeliveryCharge,
      outsideDeliveryCharge,
      videoUrl,
    } = data

    const existingProduct = await prisma.product.findUnique({
      where: {
        productId,
      },
    })

    if (!existingProduct) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
    }

    try {
      const updatedProduct = await prisma.product.update({
        where: {
          productId,
        },
        data: {
          name,
          imageUrl,
          category,
          basePrice,
          stockSize,
          suggestedMaxPrice: suggestedMaximumPrice,
          description,
          videoUrl,
          location,
          deliveryChargeInside: insideDeliveryCharge,
          deliveryChargeOutside: outsideDeliveryCharge,
        },
      })

      return updatedProduct
    } catch (error) {
      console.error('Error updating product:', error)
      throw new ApiError(500, 'পণ্য আপডেট করতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }
  /**
   * Publish a product
   * @param productId - ID of the product to publish
   */
  async publishProduct(productId: number) {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { productId },
    })

    if (!product) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
    }

    try {
      // Update the product to set it as published
      const updatedProduct = await prisma.product.update({
        where: { productId },
        data: { published: true },
      })

      return updatedProduct
    } catch (error) {
      console.error('Error publishing product:', error)
      throw new ApiError(500, 'পণ্য প্রকাশ করতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }
  /**
   * Add a list of images to the product
   * @param productId - ID of the product to add images
   * @param imageUrls - List of image URLs to add
   */
  async addProductImages(productId: number, imageUrls: string[]) {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { productId },
    })

    if (!product) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
    }

    return this.imageService.addImages(productId, imageUrls)
  }

  /**
   * Remove a product by decreasing its stock size
   * @param productId - ID of the product
   * @param quantity - Quantity to decrease from the stock size
   */
  async removeProductQuantity(productId: number, quantity: number) {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { productId },
    })

    if (!product) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
    }

    if (product.stockSize < quantity) {
      throw new ApiError(400, 'স্টক সাইজ কমানো সম্ভব নয়। পর্যাপ্ত স্টক নেই।')
    }

    try {
      // Update the stock size by decreasing it
      const updatedProduct = await prisma.product.update({
        where: { productId },
        data: {
          stockSize: product.stockSize - quantity,
        },
      })

      return updatedProduct
    } catch (error) {
      console.error('Error updating product stock size:', error)
      throw new ApiError(500, 'পণ্য স্টক সাইজ কমাতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }
  /**
   * Add meta entries to a product
   * @param productId - ID of the product
   * @param metaEntries - List of meta entries to add
   */
  async addProductMeta(
    productId: number,
    metaEntries: { key: string; value: string }[]
  ) {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { productId },
    })

    if (!product) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
    }

    return this.metaService.addMeta(productId, metaEntries)
  }
  /**
   * Add a review to a product
   * @param productId - ID of the product
   * @param sellerId - ID of the seller
   * @param review - Review text
   * @param rating - Rating for the product
   * @param sellerPhone - Seller's phone number
   * @param sellerName - Seller's name
   */
  async addProductReview(reviewDetails: {
    productId: number
    sellerId: string
    review: string
    rating: number
    sellerPhone: string
    sellerName: string
  }) {
    const { productId, sellerId, review, rating, sellerPhone, sellerName } =
      reviewDetails

    const product = await prisma.product.findUnique({
      where: { productId },
    })

    if (!product) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
    }

    return this.reviewService.addReview(
      productId,
      sellerId,
      review,
      rating,
      sellerPhone,
      sellerName
    )
  }

  // this is transactional operation
  async updateProductMeta(
    productId: number,
    metaEntries: { key: string; value: string }[]
  ) {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { productId },
    })

    if (!product) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
    }

    return await prisma.$transaction(async prisma => {
      // manually clear the meta data don't use meta service

      await prisma.productMeta.deleteMany({
        where: { productId },
      })

      // add new meta data
      const newMetaData = metaEntries.map(entry => ({
        productId,
        key: entry.key,
        value: entry.value,
      }))
      return await prisma.productMeta.createMany({
        data: newMetaData,
      })
    })
  }
}

export default new ProductService()
