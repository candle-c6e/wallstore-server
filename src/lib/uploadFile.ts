import crypto from 'crypto'
import path from 'path'
import { Request } from 'express'
import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (_req: Request, file: any, cb: any) {
    let uploadPath

    if (file.fieldname === 'categoryImage') {
      uploadPath = '/uploads/category'
    } else if (file.fieldname === 'productImage') {
      uploadPath = '/uploads/product'
    }

    cb(null, path.resolve() + uploadPath)
  },
  filename: function (_req: Request, file: any, cb: any) {
    const fileName = crypto.randomBytes(10).toString('hex')
    const newFileName = `${fileName}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, newFileName);
  }
});

export const uploadFile = multer({ storage: storage });