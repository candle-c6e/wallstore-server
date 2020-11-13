import { ObjectId } from "mongodb"

export const ProductCart = (userId: string) => {
  return [
    {
      $match: {
        userId: new ObjectId(userId)
      }
    },
    {
      $unwind: {
        path: '$products',
      }
    },
    {
      $group: {
        _id: {
          productId: "$products.productId",
          size: "$products.size",
          color: "$products.color"
        },
        cartProductId: { $first: "$products._id" },
        productId: { $first: "$products.productId" },
        size: { $first: "$products.size" },
        color: { $first: "$products.color" },
        quantity: { $first: "$products.quantity" },
        createdAt: { $first: "$products.createdAt" },
      }
    },
    {
      $lookup: {
        from: 'products',
        let: { productId: '$productId', color: '$color' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$productId"] },
            }
          },
          {
            $project: {
              _id: 0,
              productId: "$$productId",
              productName: 1,
              salePrice: 1,
              slug: 1,
              attributes: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$attributes.images",
                      as: "images",
                      cond: { $eq: ["$$images.color", "$$color"] }
                    }
                  }, 0
                ]
              }
            }
          }
        ],
        as: "products"
      }
    },
    {
      $project: {
        _id: 0,
        productId: "$_id.productId",
        productName: {
          $arrayElemAt: ["$products.productName", 0]
        },
        productImage: {
          $arrayElemAt: ["$products.attributes.small", 0]
        },
        size: "$size",
        color: "$color",
        slug: {
          $arrayElemAt: ["$products.slug", 0]
        },
        price: {
          $arrayElemAt: ["$products.salePrice", 0]
        },
        images: {
          $arrayElemAt: ["$products.images", 0]
        },
        quantity: "$quantity",
        cartProductId: "$cartProductId",
        createdAt: "$createdAt"
      }
    },
    {
      $sort: {
        createdAt: 1
      }
    }
  ]
}

export const filterProductCart = (userId: string, productId: string, size: string, color: string) => {
  return [
    {
      $match: {
        userId: new ObjectId(userId)
      },
    },
    {
      $project: {
        products: {
          $filter: {
            input: '$products',
            as: 'products',
            cond: {
              $and: [
                {
                  $eq: ['$$products.productId', new ObjectId(productId)]
                },
                {
                  $eq: ['$$products.size', size]
                },
                {
                  $eq: ['$$products.color', color]
                }
              ]
            }
          }
        }
      }
    }
  ]
}