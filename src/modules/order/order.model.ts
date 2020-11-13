export const OrderDetailModel = (orderId: string) => {
  return [
    {
      $match: {
        orderId
      }
    },
    {
      $unwind: {
        path: '$products',
      }
    },
    {
      $sort: {
        "products.createAt": 1
      }
    },
    {
      $group: {
        _id: {
          productId: "$products._id",
          size: "$products.size",
          color: "$products.color"
        },
        productId: { $first: "$products.productId" },
        size: { $first: "$products.size" },
        color: { $first: "$products.color" },
        userId: { $first: "$userId" },
        orderId: { $first: "$orderId" },
        quantity: { $first: "$products.quantity" },
        totalQuantity: { $first: "$quantity" },
        salePrice: { $first: "$products.salePrice" },
        total: { $first: "$total" },
      }
    },
    {
      $lookup: {
        from: "products",
        let: { productId: "$productId", color: "$color" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$productId"] },
            }
          },
          {
            $project: {
              productName: 1,
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
      $group: {
        _id: null,
        userId: {
          $first: "$userId"
        },
        orderId: {
          $first: "$orderId"
        },
        totalQuantity: {
          $first: "$totalQuantity"
        },
        total: {
          $first: "$total"
        },
        products: {
          $push: {
            productName: {
              $arrayElemAt: ["$products.productName", 0]
            },
            productImage: {
              $arrayElemAt: ["$products.attributes.small", 0]
            },
            salePrice: "$salePrice",
            color: "$color",
            size: "$size",
            quantity: "$quantity"
          }
        },
      }
    },
  ]
}