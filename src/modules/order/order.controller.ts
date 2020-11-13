import { ObjectId } from "mongodb";
import { RequestCustom, ResponseCustom } from "../../lib/types";
import { OrderDetailModel } from "./order.model";

export const ordersByUserId = async (req: RequestCustom, res: ResponseCustom) => {
  const payload = req.payload

  if (!payload) {
    return res.status(403).json({
      error: true,
      msg: 'You are not authorize.',
      result: []
    })
  }

  const orders = await req.db?.orders.find({ userId: new ObjectId(payload.id) }).toArray()

  if (!orders?.length) {
    return res.status(404).json({
      error: true,
      msg: 'Not found.',
      result: []
    })
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: orders
  })
}

export const orderByOrderId = async (req: RequestCustom, res: ResponseCustom) => {
  const { orderId } = req.body
  const payload = req.payload

  const order = await req.db?.orders.aggregate(OrderDetailModel(orderId)).toArray()

  if (!order?.length) {
    return res.status(404).json({
      error: true,
      msg: 'Not found.',
      result: []
    })
  }

  if (String(order[0].userId) !== String(payload.id)) {
    return res.status(200).json({
      error: true,
      msg: 'You are not permitted.',
      result: []
    })
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: order
  })
}

export const createOrder = async (req: RequestCustom, res: ResponseCustom) => {
  const payload = req.payload

  if (!payload) {
    return res.status(403).json({
      error: true,
      msg: 'You are not authorize.',
      result: []
    })
  }

  const lastedOrder = await req.db?.orders.find({}, { projection: { orderId: 1 } }).sort({ orderId: -1 }).limit(1).toArray()

  let randNum = '1'

  if (!lastedOrder?.length) {
    randNum = randNum.padStart(6, '0')
  } else {
    let runRandNum = parseInt(randNum) + 1
    randNum = String(runRandNum).padStart(6, '0')
  }

  const cartProduct = await req.db?.carts.findOne({ userId: new ObjectId(payload.id) }, { projection: { products: 1 } })

  if (!cartProduct) {
    return res.status(403).json({
      error: true,
      msg: 'You cart not exists.',
      result: []
    })
  }

  let totalPrice = 0
  let totalQuantity = 0
  const products = []

  for (let product of cartProduct?.products) {
    totalQuantity += product.quantity
    const productPrice = await req.db?.products.findOne({ _id: new ObjectId(product.productId) }, { projection: { salePrice: 1 } })
    if (productPrice) {
      totalPrice += productPrice.salePrice * product.quantity
      products.push({ ...product, salePrice: productPrice.salePrice })
    }
  }

  await req.db?.orders.insertOne({
    orderId: randNum,
    userId: new ObjectId(payload.id),
    products,
    quantity: totalQuantity,
    total: totalPrice,
    createdAt: new Date(),
    updatedAt: null
  })

  await req.db?.carts.deleteOne({ userId: new ObjectId(payload.id) })

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: []
  })
}