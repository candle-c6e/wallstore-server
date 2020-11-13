
import argon from 'argon2'
import { RequestCustom, ResponseCustom } from "../../lib/types";
import { generateAccessToken, generateRefreshToken } from '../../lib/auth';
import { ObjectId } from 'mongodb';

export const revokeToken = async (req: RequestCustom, res: ResponseCustom) => {
  const userId = req.body.userId

  await req.db?.users.updateOne({ _id: new ObjectId(userId) }, { $inc: { tokenVersion: 1 } })

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: []
  })
}

export const me = async (req: RequestCustom, res: ResponseCustom) => {
  if (!req.payload) {
    return res.status(200).json({
      error: true,
      msg: 'Not authorize.',
      result: []
    })
  }

  const user = await req.db?.users.findOne({ _id: new ObjectId(req.payload.id) })

  if (!user) {
    return res.status(200).json({
      error: true,
      msg: 'Not authorize.',
      result: []
    })
  }

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: {
      id: user._id,
      name: user.name,
      roles: user.roles
    }
  })
}

export const register = async (req: RequestCustom, res: ResponseCustom) => {
  const { name, email, username, password } = req.body

  let user

  user = await req.db?.users.findOne({ $or: [{ username }, { email }] })

  if (user) {
    return res.status(500).json({
      error: true,
      msg: 'User is exists.',
      result: []
    })
  }

  const hashedPassword = await argon.hash(password)

  user = await req.db?.users.insertOne({
    name,
    email,
    username,
    password: hashedPassword,
    avatar: null,
    accountNo: null,
    address: null,
    orders: [],
    products: [],
    tokenVersion: 0,
    roles: 'user',
    createdAt: new Date()
  })

  if (!user) {
    return res.status(500).json({
      error: true,
      msg: 'Something wrong please try again later.',
      result: []
    })
  }

  const accessToken = generateAccessToken(user?.ops[0])
  const refreshToken = generateRefreshToken(user?.ops[0])

  res.cookie('access-token', accessToken, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 15, signed: true })
  res.cookie('refresh-token', refreshToken, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7, signed: true })

  const userDetail = user.ops[0]

  return res.status(201).json({
    error: false,
    msg: 'OK.',
    result: {
      id: userDetail._id,
      name: userDetail.name,
      avatar: userDetail.avatar,
      roles: userDetail.roles
    }
  })
}

export const login = async (req: RequestCustom, res: ResponseCustom) => {
  const { username, password } = req.body

  let user

  user = await req.db?.users.findOne({ username })

  if (!user) {
    return res.status(404).json({
      error: true,
      msg: 'User is not exists.',
      result: []
    })
  }

  const isMatched = await argon.verify(user.password, password)

  if (!isMatched) {
    return res.status(500).json({
      error: true,
      msg: 'Incorrect password.',
      result: []
    })
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  res.cookie('access-token', accessToken, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 15, signed: true })
  res.cookie('refresh-token', refreshToken, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7, signed: true })

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: {
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      roles: user.roles
    }
  })
}

export const logout = (_req: RequestCustom, res: ResponseCustom) => {
  res.clearCookie('access-token')
  res.clearCookie('refresh-token')

  return res.status(200).json({
    error: false,
    msg: 'OK.',
    result: []
  })
}