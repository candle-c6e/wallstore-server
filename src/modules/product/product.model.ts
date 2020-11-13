import { ObjectId } from "mongodb"

export const ProductFeatureModel = () => {
  return [
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
      $limit: 4
    }
  ]
}

export const ProductsModel = () => {
  return [
    {
      $project: {
        _id: 1,
        productName: 1,
        slug: 1,
        attributes: 1,
        price: 1,
        salePrice: 1,
        rating: 1,
        createdAt: 1,
        updatedAt: 1
      }
    },
    {
      $sort: {
        createdAt: -1
      },
    },
  ]
}

export const ProductByIdModel = (productId?: string) => {
  return [
    {
      $match: {
        _id: new ObjectId(productId)
      }
    },
    {
      $lookup: {
        from: "categories",
        let: { categoryId: "$categoryId" },
        pipeline: [
          {
            $match: {
              $expr: {
                _id: "$$categoryId"
              }
            }
          },
          {
            $project: {
              _id: 0,
              categoryName: 1
            }
          }
        ],
        as: "category"
      }
    },
    {
      $project: {
        _id: 1,
        productName: 1,
        category: "$categoryId",
        description: 1,
        slug: 1,
        images: 1,
        price: 1,
        salePrice: 1,
        rating: 1,
        attributes: 1,
        createdAt: 1
      }
    },
    {
      $limit: 1
    }
  ]
}

export const ProductModel = (slug?: string) => {
  return [
    {
      $match: {
        slug: slug
      }
    },
    {
      $lookup: {
        from: "categories",
        let: { categoryId: "$categoryId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$categoryId"]
              }
            }
          },
          {
            $project: {
              categoryName: 1
            }
          }
        ],
        as: "category"
      }
    },
    {
      $project: {
        _id: 1,
        productName: 1,
        category: {
          $arrayElemAt: [
            "$category.categoryName",
            0
          ]
        },
        description: 1,
        slug: 1,
        price: 1,
        salePrice: 1,
        rating: 1,
        attributes: 1,
        createdAt: 1
      }
    },
    {
      $limit: 1
    }
  ]
}