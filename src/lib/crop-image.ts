import type { Area } from 'react-easy-crop'

function getImageDimensions(imageSrc: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', reject)
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = imageSrc
  })
}

export async function getCroppedImage(imageSrc: string, croppedAreaPixels: Area, fileName: string) {
  const image = await getImageDimensions(imageSrc)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to crop image')
  }

  canvas.width = croppedAreaPixels.width
  canvas.height = croppedAreaPixels.height

  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  )

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95))

  if (!blob) {
    throw new Error('Unable to crop image')
  }

  return new File([blob], fileName, { type: 'image/jpeg' })
}
