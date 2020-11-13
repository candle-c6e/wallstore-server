import { Images } from "./types"

export const mapImages = (files: string[]): Images[] => {
  let images: Images[] = []

  if (files && files.length) {
    images = files.map((file: string) => {
      const filename = file.split('.')
      return {
        small: `${filename[0]}-small.${filename[1]}`,
        large: `${filename[0]}.${filename[1]}`,
      }
    })
  }

  return images
}