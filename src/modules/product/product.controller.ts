import { ObjectId } from "mongodb";
import slug from 'slug'
import { unlinkFile } from "../../lib/unlinkFile";
import { mapImages } from "../../lib/mapImages";
import { Attributes, Images, ProductImages, RequestCustom, ResponseCustom } from "../../lib/types";
import { ProductFeatureModel, ProductModel, ProductsModel, ProductByIdModel } from "./product.model";

export const featureProducts = async (req: RequestCustom, res: ResponseCustom) => {
  const products = await req.db?.products.aggregate(ProductFeatureModel()).toArray()

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: products
  })
}

export const products = async (req: RequestCustom, res: ResponseCustom) => {
  const products = await req.db?.products.aggregate(ProductsModel()).toArray()

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: products
  })
}

export const product = async (req: RequestCustom, res: ResponseCustom) => {
  const productId = req.query.productId?.toString()

  const product = await req.db?.products.aggregate(ProductByIdModel(productId)).toArray()

  if (!product?.length) {
    return res.status(404).json({
      error: true,
      msg: 'Product is not exists.',
      result: []
    })
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: product
  })
}

export const productBySlug = async (req: RequestCustom, res: ResponseCustom) => {
  const slug = req.query.slug?.toString()

  const products = await req.db?.products.aggregate(ProductModel(slug)).toArray()

  if (!products?.length) {
    return res.status(404).json({
      error: true,
      msg: 'Product is not exists.',
      result: []
    })
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: products
  })
}

export const createProduct = async (req: RequestCustom, res: ResponseCustom) => {
  const { productName, categoryId, description, price, salePrice, size = null, color = null } = req.body
  const images: Images[] = mapImages(req.body.images)

  const slugProduct = slug(productName)

  const isSlugExists = await req.db?.products.findOne({ slug: slugProduct })

  let sizeProduct: any[] = []
  let colorProduct: any[] = []

  if (isSlugExists) {
    unlinkFile('product', images)

    return res.status(500).json({
      error: true,
      msg: 'Slug is exists.',
      result: []
    })
  }

  if (size) {
    if (typeof size !== 'object') {
      sizeProduct = [size]
    } else {
      size.forEach((item: string) => {
        sizeProduct.push(item)
      })
    }
  } else {
    sizeProduct = []
  }

  if (color) {
    if (typeof color !== 'object') {
      if (color) {
        colorProduct.push(color)
      }
    } else {
      colorProduct = color
    }
  } else {
    colorProduct = []
  }

  const productImage: ProductImages[] = images.map((image, index) => {
    return {
      _id: new ObjectId(),
      color: colorProduct.length ? colorProduct[index] : null,
      small: image.small,
      large: image.large
    }
  })

  const attributesProduct: Attributes = { size: sizeProduct, images: productImage }

  await req.db?.products.insertOne({
    productName,
    slug: slug(productName),
    categoryId: new ObjectId(categoryId),
    description,
    price: parseFloat(price),
    salePrice: parseFloat(salePrice),
    attributes: attributesProduct,
    rating: 0,
    createdAt: new Date(),
    updatedAt: null
  })

  return res.status(201).json({
    error: false,
    msg: 'OK',
    result: []
  })
}

export const editProduct = async (req: RequestCustom, res: ResponseCustom) => {
  const { productId, productName, categoryId, description, price, salePrice, size, color } = req.body
  const images: Images[] = mapImages(req.body.images)

  const product = await req.db?.products.findOne({ _id: new ObjectId(productId) })

  if (!product) {
    unlinkFile('product', images)

    return res.status(404).json({
      error: true,
      msg: 'Product is not exists.',
      result: []
    })
  }

  const sizeProduct: string[] = []
  let colorProduct: any[] = []

  if (size.length) {
    size.forEach((item: string) => {
      sizeProduct.push(item)
    })
  }

  if (color) {
    if (typeof color !== 'object') {
      if (color) {
        colorProduct.push(color)
      }
    } else {
      colorProduct = color
    }
  } else {
    colorProduct = []
  }

  let productImage = product.attributes?.images!

  if (images.length) {
    const newProductImages: ProductImages[] = images.map((image, index) => {
      return {
        _id: new ObjectId(),
        color: colorProduct.length ? colorProduct[index] : null,
        small: image.small,
        large: image.large
      }
    })

    productImage = [...productImage, ...newProductImages]
  }

  const attributesProduct: Attributes = { size: sizeProduct, images: productImage }

  await req.db?.products.updateOne({
    _id: new ObjectId(productId)
  }, {
    $set: {
      productName,
      slug: slug(productName),
      categoryId: new ObjectId(categoryId),
      description,
      price: parseFloat(price),
      salePrice: parseFloat(salePrice),
      attributes: attributesProduct,
      updatedAt: new Date()
    },
  })

  return res.status(200).json({
    error: false,
    msg: 'OK',
    result: []
  })
}

export const deleteProduct = async (req: RequestCustom, res: ResponseCustom) => {
  const { productId } = req.body

  const product = await req.db?.products.findOne({ _id: new ObjectId(productId) })

  const productImage = product?.attributes?.images?.map(image => image)

  if (productImage?.length) {
    unlinkFile('product', productImage)
  }

  await req.db?.products.deleteOne({ _id: new ObjectId(productId) })

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: []
  })
}

export const deleteImage = async (req: RequestCustom, res: ResponseCustom) => {
  const { productId, attributeId } = req.body

  const attribute = await req.db?.products.findOneAndUpdate(
    { _id: new ObjectId(productId) },
    { $pull: { "attributes.images": { _id: new ObjectId(attributeId) } } },
  )

  if (attribute) {
    const productImages = attribute.value!.attributes!.images.map(image => {
      if (String(image._id) === String(attributeId)) {
        return {
          small: image.small,
          large: image.large
        }
      }

      return {
        small: '',
        large: ''
      }
    })

    if (productImages.length) {
      unlinkFile('product', productImages)
    }
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: []
  })
}

export const sortAttributes = async (req: RequestCustom, res: ResponseCustom) => {
  const { productId, attributes } = req.body

  if (attributes.length) {
    const sortedAttributes: any = []
    const productAttributes = await req.db?.products.findOne({ _id: new ObjectId(productId) })

    for (let attribute of attributes) {
      const productAttribute = productAttributes?.attributes?.images.find(group => String(group._id) === String(attribute._id))
      sortedAttributes.push(productAttribute)
    }

    await req.db?.products.updateOne({ _id: new ObjectId(productId) }, { $set: { 'attributes.images': sortedAttributes } })
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: []
  })
}