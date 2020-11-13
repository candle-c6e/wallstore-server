import fs from 'fs'
import path from 'path'
import { Images } from './types'

export const unlinkFile = (localPath: string, files: Images[]) => {
  files.forEach(file => {
    fs.unlink(`${path.resolve()}/uploads/${localPath}/${file.large}`, (_err) => { })
    fs.unlink(`${path.resolve()}/uploads/${localPath}/${file.small}`, (_err) => { })
  })
}