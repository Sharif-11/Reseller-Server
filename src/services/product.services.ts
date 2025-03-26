import ApiError from '../utils/ApiError' // Importing your custom ApiError
import prisma from '../utils/prisma'

interface GetProductsFilters {
  name?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  pageSize?: number
}

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
  async deleteImage(imageId: number) {
    // console.log({ productId, imageId })
    try {
      return await prisma.productImage.delete({
        where: {
          imageId,
        },
      })
    } catch (error) {
      console.log(error)
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
    metaEntries: { key: string; value: string }[],
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
    sellerName: string,
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
    stockSize?: number
    suggestedMaxPrice: number
    description: string
    location: string
    deliveryChargeInside: number
    deliveryChargeOutside: number
    videoUrl?: string
  }) {
    const {
      name,
      imageUrl,
      category,
      basePrice,
      stockSize,
      suggestedMaxPrice,
      description,
      location,
      deliveryChargeInside,
      deliveryChargeOutside,
      videoUrl,
    } = data

    try {
      const newProduct = await prisma.product.create({
        data: {
          name,
          imageUrl,
          category,
          basePrice,
          stockSize: Number(stockSize) || 0,
          suggestedMaxPrice,
          videoUrl,
          location,
          deliveryChargeInside,
          deliveryChargeOutside,
          isVerifiedProduct: false,
          published: false,
          description,
        },
      })

      return newProduct
    } catch (error) {
      console.error('Error creating product:', error)
      throw new ApiError(500, 'পণ্য তৈরি করতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }
  /**
   * Get a product by ID, including images and metas
   * @param productId - ID of the product to retrieve
   */
  async getProduct(productId: number) {
    try {
      const product = await prisma.product.findUnique({
        where: { productId },
        include: {
          images: {
            select: {
              imageId: true,
              imageUrl: true,
            },
          },
          metas: {
            select: {
              key: true,
              value: true,
            },
          },
        },
      })

      if (!product) {
        throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
      }

      return product
    } catch (error) {
      console.error('Error retrieving product:', error)
      throw new ApiError(500, 'পণ্য লোড করতে ব্যর্থ। আবার চেষ্টা করুন।')
    }
  }
  async getAllProducts(filters: GetProductsFilters, isPublished?: boolean) {
    const { name, category, minPrice, maxPrice, page, pageSize } = filters

    const where: any = {}

    // Add optional 'published' filter
    if (isPublished !== undefined) {
      where.published = isPublished // Filter by published status if specified
    }

    // Add filters for name and category
    if (name) {
      where.name = {
        startsWith: name,
        mode: 'insensitive', // Case-insensitive prefix match
      }
    }

    if (category) {
      where.category = {
        startsWith: category,
        mode: 'insensitive', // Case-insensitive prefix match
      }
    }

    // Add price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      }
    }

    // Pagination is optional
    let skip, take
    if (page && pageSize) {
      skip = (page - 1) * pageSize
      take = pageSize
    }

    // Fetch data
    const products = await prisma.product.findMany({
      where,
      select: {
        name: true,
        imageUrl: true,
        basePrice: true,
        productId: true,
        published: true,
      },
      orderBy: {
        createdAt: 'desc', // Most recently added at the top
      },
      ...(skip !== undefined && take !== undefined ? { skip, take } : {}), // Include pagination if provided
    })

    // Total count for pagination (only calculated if pagination is used)
    const totalProducts =
      page && pageSize ? await prisma.product.count({ where }) : undefined

    return {
      products,
      ...(totalProducts !== undefined && page && pageSize
        ? {
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / pageSize),
          }
        : {}),
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
        include: {
          images: true,
          metas: true,
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
  async unpublishProduct(productId: number) {
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
        data: { published: false },
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

    await this.imageService.addImages(productId, imageUrls)

    return this.getProduct(product.productId)
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
    metaEntries: { key: string; value: string }[],
  ) {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { productId },
    })

    if (!product) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
    }

    await this.metaService.addMeta(productId, metaEntries)
    return this.getProduct(product.productId)
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
    //check seller id existence
    const seller = await prisma.user.findUnique({
      where: { userId: sellerId },
    })

    if (!seller) {
      throw new ApiError(404, 'বিক্রেতা পাওয়া যায়নি।')
    }

    return this.reviewService.addReview(
      productId,
      sellerId,
      review,
      rating,
      seller.phoneNo,
      seller.name,
    )
  }

  // this is transactional operation
  async updateProductMeta(
    productId: number,
    metaEntries: { key: string; value: string }[],
  ) {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { productId },
    })

    if (!product) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
    }

    const result = await prisma.$transaction(async prisma => {
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
    return this.getProduct(product.productId)
  }
  async deleteImage(productId: number, imageId: number) {
    const product = await this.getProduct(productId)

    if (!product) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।')
    }
    // check whether the image exists
    const image = await prisma.productImage.findUnique({
      where: { imageId },
    })

    if (!image) {
      throw new ApiError(404, 'ছবি পাওয়া যায়নি।')
    }

    //check whether the image is related to this product
    if (image.productId !== productId) {
      throw new ApiError(400, 'ছবি এই পণ্যের নয়।')
    }

    await this.imageService.deleteImage(imageId)
    return this.getProduct(product.productId)
  }
  async createOrUpdateProductMeta(
    productId: number,
    metaEntries: { key: string; value: string }[]
  ) {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { productId },
    });

    if (!product) {
      throw new ApiError(404, 'পণ্য পাওয়া যায়নি।');
    }

    // Use transaction to ensure atomic operation
    const result = await prisma.$transaction(async prisma => {
      // First delete all existing meta entries for this product
      await prisma.productMeta.deleteMany({
        where: { productId },
      });

      // Then create new meta entries
      const newMetaData = metaEntries.map(entry => ({
        productId,
        key: entry.key,
        value: entry.value,
      }));

      return await prisma.productMeta.createMany({
        data: newMetaData,
      });
    });

    return this.getProduct(product.productId);
  }
  async getMeta(productId: number) {
    try {
      const metaData = await prisma.productMeta.findMany({
        where: {
          productId,
        },
        select: {
          key: true,
          value: true,
        },
      });

      return metaData;
    } catch (error) {
      throw new ApiError(500, 'মেটা ডেটা লোড করতে ব্যর্থ। আবার চেষ্টা করুন।');
    }
  }
}

export default new ProductService()
