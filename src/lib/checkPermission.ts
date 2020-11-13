import { NextFunction } from "express"
import { RequestCustom, ResponseCustom } from "./types"

export const checkPermission = (req: RequestCustom, res: ResponseCustom, next: NextFunction) => {
  const payload = req.payload

  if (!payload) {
    return res.status(403).json({
      error: true,
      msg: 'Your are not authorize.',
      result: []
    })
  }

  if (payload.roles !== 'admin') {
    return res.status(403).json({
      error: true,
      msg: 'Your are not permitted.',
      result: []
    })
  }

  next()
}