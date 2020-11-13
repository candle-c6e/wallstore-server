import { MongoClient } from 'mongodb'
import { Database } from '../lib/types'

const url = process.env.DATABASE_URL as string

export const connectDatabase = async (): Promise<Database> => {
  try {
    const connect = await MongoClient.connect(url, { useNewUrlParser: true })
    const db = connect.db('wallstore')

    return {
      categories: db.collection('categories'),
      products: db.collection('products'),
      carts: db.collection('carts'),
      users: db.collection('users'),
      orders: db.collection('orders')
    }
  } catch (err) {
    throw new Error(err)
  }
}
