import { ObjectId } from "mongodb";
import { RequestCustom, ResponseCustom } from "../../lib/types";
import { filterProductCart, ProductCart } from "./cart.model";

export const cart = async (req: RequestCustom, res: ResponseCustom) => {
  const payload = req.payload

  if (!payload) {
    return res.status(403).json({
      error: true,
      msg: 'You are not authorize.',
      result: []
    })
  }

  const cart = await req.db?.carts.aggregate(ProductCart(payload.id)).toArray()

  if (!cart) {
    return res.status(404).json({
      error: true,
      msg: 'Cart not exists.',
      result: []
    })
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: cart
  })
}

export const addToCart = async (req: RequestCustom, res: ResponseCustom) => {
  const { productId, size, color, quantity } = req.body
  const payload = req.payload

  if (!payload) {
    return res.status(403).json({
      error: true,
      msg: 'You are not authorize.',
      result: []
    })
  }

  const cart = await req.db?.carts.findOne({ userId: new ObjectId(payload.id) })

  if (cart) {
    const cartExists = await req.db?.carts.aggregate(filterProductCart(payload.id, productId, size, color)).toArray()
    if (cartExists && cartExists[0].products.length) {
      const productExists = await req.db?.carts.findOne(
        { userId: new ObjectId(payload.id), 'products.productId': new ObjectId(productId), 'products.size': size, 'products.color': color }
      )
      if (productExists) {
        await req.db?.carts.updateOne(
          { userId: new ObjectId(payload.id), products: { $elemMatch: { 'productId': new ObjectId(productId), 'size': size, 'color': color } } },
          { $set: { 'products.$.quantity': cartExists[0].products[0].quantity + parseInt(quantity) } }
        )
      } else {
        await req.db?.carts.updateOne(
          { userId: new ObjectId(payload.id) },
          { $push: { products: { _id: new ObjectId(), productId: new ObjectId(productId), size, color, quantity: parseInt(quantity), createdAt: new Date() } } }
        )
      }
    } else {
      await req.db?.carts.updateOne(
        { userId: new ObjectId(payload.id) },
        { $push: { products: { _id: new ObjectId(), productId: new ObjectId(productId), size, color, quantity: parseInt(quantity), createdAt: new Date() } } }
      )
    }
  } else {
    await req.db?.carts.insertOne({
      userId: new ObjectId(payload.id),
      products: [{
        _id: new ObjectId(),
        productId: new ObjectId(productId),
        size,
        color,
        quantity: parseInt(quantity),
        createdAt: new Date()
      }],
      createdAt: new Date()
    })
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: []
  })
}

export const updateProductCart = async (req: RequestCustom, res: ResponseCustom) => {
  const { cartProductId, quantity } = req.body
  const payload = req.payload

  if (!payload) {
    return res.status(403).json({
      error: true,
      msg: 'You are not authorize.',
      result: []
    })
  }

  const productExists = await req.db?.carts.findOne(
    { userId: new ObjectId(payload.id), 'products._id': new ObjectId(cartProductId) }
  )

  if (productExists) {
    const product = productExists.products.find(product => String(product._id) === cartProductId)

    if (product) {
      await req.db?.carts.updateOne(
        { userId: new ObjectId(payload.id), 'products._id': new ObjectId(cartProductId) },
        { $set: { 'products.$.quantity': parseInt(quantity) } }
      )
    }
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: []
  })
}

export const deleteProductCart = async (req: RequestCustom, res: ResponseCustom) => {
  const { cartProductId } = req.body
  const payload = req.payload

  await req.db?.carts.updateOne({ userId: new ObjectId(payload.id) }, { $pull: { products: { _id: new ObjectId(cartProductId) } } })

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: []
  })
}