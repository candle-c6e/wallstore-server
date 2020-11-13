import { NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { generateAccessToken } from './auth'
import { RequestCustom, ResponseCustom } from './types'

interface Payload {
  tokenVersion: number
  id: string
}

export const isAuth = async (req: RequestCustom, res: ResponseCustom, next: NextFunction) => {
  const accessToken = req.signedCookies['access-token']
  const refreshToken = req.signedCookies['refresh-token']

  if (!accessToken && !refreshToken) {
    return res.status(200).json({
      error: true,
      msg: 'Your are not authorize.',
      result: []
    })
  }

  try {
    let payload

    payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN!) as Payload
    req.payload = payload

    return next()
  } catch (err) { }

  try {
    let payload
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN!) as Payload

    const user = await req.db?.users.findOne({ _id: new ObjectId(payload.id) })

    if (!user) {
      return res.status(403).json({
        error: true,
        msg: 'Your are not authorize.',
        result: []
      })
    }

    if (payload.tokenVersion !== user.tokenVersion) {
      return res.status(403).json({
        error: true,
        msg: 'Token is expire.',
        result: []
      })
    }

    const accessToken = generateAccessToken(user)

    req.payload = payload
    res.cookie('access-token', accessToken, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 15, signed: true })

  } catch (err) {
    return res.status(403).json({
      error: true,
      msg: 'Token is expire.',
      result: []
    })
  }

  return next()
}