import { Request, Response } from 'express';
import { Collection, ObjectId } from 'mongodb'

export interface Images {
  small: string
  large: string
}

export interface ProductImages extends Images {
  _id: ObjectId
  color: string | null
}

interface Category {
  _id: ObjectId
  categoryName: string
  images: Images[]
  createdAt?: Date
  updatedAt?: Date | null
}

export interface Attributes {
  images: ProductImages[]
  size: string[] | []
}

interface Product {
  _id: ObjectId
  categoryId: ObjectId
  productName: string
  slug: string
  description: string
  price: number
  salePrice: number
  attributes: Attributes | null
  rating?: number
  createdAt?: Date
  updatedAt?: Date | null
}

interface Rating {
  _id: ObjectId
  productId: ObjectId
  userId: ObjectId
  rating: number
}

interface Order {
  _id: ObjectId
  orderId: string
  userId: ObjectId
  products: CartDetail[]
  quantity: number
  total: number
  createdAt?: Date
  updatedAt?: Date | null
}

interface CartDetail {
  _id: ObjectId
  productId: ObjectId
  color: string | null
  size: string | null
  quantity: number
  createdAt: Date
}

interface Cart {
  _id: ObjectId
  userId: ObjectId
  products: CartDetail[]
  createdAt?: Date
}

export interface User {
  _id: ObjectId
  name: string
  email: string
  username: string
  password: string
  avatar: string | null
  address: string | null
  accountNo: string | null
  products: ObjectId[] | []
  orders: ObjectId[] | []
  roles: string
  createdAt?: Date
  updatedAt?: Date | null
  tokenVersion: number
}

interface jsonBody {
  error: boolean
  msg: string
  result: any
}

type ResponseObject = (body?: jsonBody) => any

export interface RequestCustom extends Request {
  db?: Database,
  payload?: any
}

export interface ResponseCustom extends Response {
  json: ResponseObject
}

export interface Database {
  categories: Collection<Category>
  products: Collection<Product>
  carts: Collection<Cart>
  users: Collection<User>
  orders: Collection<Order>
  ratings: Collection<Rating>
}