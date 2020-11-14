import { MongoClient } from 'mongodb'
import { __PROD__ } from '../constant'
import { Database } from '../lib/types'

let url = ''

if (__PROD__) {
  url = `mongodb://${process.env.DATABASE_USERNAME}:${encodeURIComponent(process.env.DATABASE_PASSWORD!)}@localhost:27017/wallstore`
} else {
  url = 'mongodb://localhost:27017/wallstore'
}

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
