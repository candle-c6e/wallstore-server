import { ObjectId } from 'mongodb'
import { __LIMIT__ } from '../../constant'
import { mapImages } from '../../lib/mapImages'
import { Images, RequestCustom, ResponseCustom } from "../../lib/types"
import { unlinkFile } from '../../lib/unlinkFile'
import { ProductCategoryModel } from './category.model'

export const categoriesClient = async (req: RequestCustom, res: ResponseCustom) => {
  const categories = await req.db?.categories.find(
    {},
    { projection: { categoryName: 1, images: 1, createdAt: 1, updatedAt: 1 } }
  ).sort({ createdAt: 1 }).toArray()

  let result = []

  if (categories?.length) {
    for (let category of categories) {
      const categoryProduct = []
      const products = await req.db?.products.find({ categoryId: category._id }).toArray()
      if (products?.length) {
        let totalPages: number = 0
        totalPages = Math.ceil(products?.length / __LIMIT__);
        for (let round = 1; round <= totalPages; round++) {
          categoryProduct.push({
            category: category.categoryName,
            page: String(round)
          })
        }
      }
      result.push(...categoryProduct)
    }
  }


  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result
  })
}

export const categories = async (req: RequestCustom, res: ResponseCustom) => {
  const categories = await req.db?.categories.find(
    {},
    { projection: { categoryName: 1, images: 1, createdAt: 1, updatedAt: 1 } }
  ).sort({ createdAt: 1 }).toArray()


  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: categories
  })
}

export const category = async (req: RequestCustom, res: ResponseCustom) => {
  const { categoryId } = req.query

  const category = await req.db?.categories.findOne({ _id: new ObjectId(categoryId?.toString()) })

  if (!category) {
    return res.status(404).json({
      error: true,
      msg: 'Category not exists.',
      result: []
    })
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: category
  })
}

export const productCategory = async (req: RequestCustom, res: ResponseCustom) => {
  const { categoryName, page = 1 } = req.query

  const pageNumber: number = +page!
  const limit: number = __LIMIT__
  const skip: number = (pageNumber - 1) * limit

  const category = await req.db?.categories.findOne({ categoryName: categoryName?.toString() })

  if (!category) {
    return res.status(404).json({
      error: true,
      msg: 'Category not exists.',
      result: []
    })
  }


  const products = await req.db?.products.aggregate(ProductCategoryModel(category._id, skip, limit)).toArray()
  const totalProducts = await req.db?.products.find({ categoryId: new ObjectId(category._id) }).count()

  let totalPages: number = 0

  if (totalProducts) {
    totalPages = Math.ceil(totalProducts / __LIMIT__);
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: {
      products,
      totalPages
    }
  })
}

export const createCategory = async (req: RequestCustom, res: ResponseCustom) => {
  const { categoryName } = req.body
  const images: Images[] = mapImages(req.body.images)

  let category
  category = await req.db?.categories.findOne({ categoryName })

  if (category) {
    unlinkFile('category', images)

    return res.status(500).json({
      error: true,
      msg: 'Category is exists.',
      result: []
    })
  }

  category = await req.db?.categories.insertOne({
    categoryName,
    images,
    createdAt: new Date(),
    updatedAt: null
  })

  return res.status(201).json({
    error: false,
    msg: 'OK.',
    result: category?.ops
  })
}

export const editCategory = async (req: RequestCustom, res: ResponseCustom) => {
  const { categoryId, categoryName } = req.body
  const images: Images[] = mapImages(req.body.images)

  let category

  category = await req.db?.categories.findOne({ _id: new ObjectId(categoryId) })

  if (!category) {
    unlinkFile('category', images)

    return res.status(404).json({
      error: true,
      msg: 'Category not exists.',
      result: []
    })
  }

  if (images && images.length) {

    if (category.images) {
      unlinkFile('category', category.images)
    }

    category = await req.db?.categories.findOneAndUpdate(
      { _id: new ObjectId(categoryId) },
      { $set: { images, updatedAt: new Date() } },
    )
  } else {
    category = await req.db?.categories.findOneAndUpdate(
      { _id: new ObjectId(categoryId) },
      { $set: { categoryName, updatedAt: new Date() } },
    )
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: category?.value?.categoryName
  })
}

export const deleteCategory = async (req: RequestCustom, res: ResponseCustom) => {
  const { categoryId } = req.body

  const category = await req.db?.categories.findOne({ _id: new ObjectId(categoryId) })

  if (!category) {
    return res.status(404).json({
      error: true,
      msg: 'Category not exists.',
      result: []
    })
  }

  unlinkFile('category', category.images)

  await req.db?.categories.findOneAndDelete({ _id: new ObjectId(categoryId) })

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: []
  })
}