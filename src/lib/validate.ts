import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator'

interface Errors {
  [key: string]: [value: string]
}

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next()
  }

  const extractedErrors: Errors[] = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(400).json({ errors: extractedErrors });
}