import path from 'path'
import { Response, NextFunction } from 'express'
import { RequestCustom } from './types'
import sharp from 'sharp'

export const formatFile = async (req: RequestCustom, _res: Response, next: NextFunction) => {
  if (!req.files.length) return next()

  req.body.images = []

  const files = Object.values(req.files);

  for (let file of files) {
    const fileName = file.filename.split('.')[0]
    const extensionFile = file.filename.split('.')[1]
    let uploadPath

    if (file.fieldname === 'categoryImage') {
      uploadPath = `${path.resolve()}/uploads/category/`
    } else if (file.fieldname === 'productImage') {
      uploadPath = `${path.resolve()}/uploads/product/`
    }

    // for webp
    // await sharp(file.path).clone().webp().toFile(`${uploadPath}${fileName}.webp` as string)

    // for small image
    if (extensionFile === 'jpg' || extensionFile === 'jpeg') {
      await sharp(file.path)
        .clone()
        .resize(300)
        .jpeg({ quality: 90, progressive: true })
        .toFile(`${uploadPath}${fileName}-small.${extensionFile}` as string)
    } else if (extensionFile === 'png') {
      await sharp(file.path)
        .clone()
        .resize(300)
        .png({ quality: 90, progressive: true })
        .toFile(`${uploadPath}${fileName}-small.${extensionFile}` as string)
    }

    req.body.images.push(`${fileName}.${extensionFile}`)
  }

  next()
}