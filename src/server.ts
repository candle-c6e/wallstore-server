import * as dotenv from 'dotenv'
dotenv.config()
import path from 'path'
import express, { Application, NextFunction, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { connectDatabase } from './database'
import { RequestCustom } from './lib/types'
import router from './routes'

const app: Application = express()

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(helmet())
app.use(compression())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser(process.env.SECRET_COOKIE))
app.use('/uploads', express.static(`${path.resolve()}/uploads`))

app.use(async (req: RequestCustom, _res: Response, next: NextFunction) => {
  const db = await connectDatabase()
  req.db = db
  next()
})

app.use('/', router)

app.listen(5000, () => {
  console.log(`SERVER IS RUNNING 5000`)
})