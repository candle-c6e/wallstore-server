import { ObjectId } from "mongodb"

export const ProductCategoryModel = (categoryId: ObjectId, skip: number, limit: number) => {
  return [
    {
      $match: {
        categoryId: new ObjectId(categoryId)
      }
    },
    {
      $project: {
        _id: 1,
        productName: 1,
        slug: 1,
        attributes: 1,
        price: 1,
        salePrice: 1,
        rating: 1,
        createdAt: 1
      },
    },
    {
      $sort: {
        createdAt: -1
      },
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ]
}