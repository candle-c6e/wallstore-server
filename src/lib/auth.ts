import jwt from 'jsonwebtoken'
import { User } from '../lib/types'

export const generateAccessToken = (user: User) => {
  return jwt.sign({ id: user?._id, tokenVersion: user.tokenVersion, roles: user.roles }, process.env.ACCESS_TOKEN as string, { expiresIn: '15m' })
}

export const generateRefreshToken = (user: User) => {
  return jwt.sign({ id: user?._id, tokenVersion: user.tokenVersion, roles: user.roles }, process.env.REFRESH_TOKEN as string, { expiresIn: '7d' })
}