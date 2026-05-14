import { json } from '@/src/app/api/_lib'
import { getCloudinaryClient } from '@/src/lib/cloudinary'

export const runtime = 'nodejs'

async function fileToBuffer(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = String(formData.get('folder') ?? 'shopup')

    if (!(file instanceof File)) {
      return json({ error: 'File is required' }, 400)
    }

    const cloudinary = getCloudinaryClient()
    const buffer = await fileToBuffer(file)

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, uploadResult) => {
          if (error) {
            reject(error)
            return
          }

          if (!uploadResult) {
            reject(new Error('Cloudinary upload failed'))
            return
          }

          resolve(uploadResult)
        }
      )

      stream.end(buffer)
    })

    return json({
      data: {
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width ?? null,
        height: result.height ?? null,
        format: result.format ?? null,
        bytes: result.bytes ?? null,
      },
    }, 201)
  } catch (error: unknown) {
    return json(
      {
        error: error instanceof Error ? error.message : 'Unable to upload file',
      },
      500
    )
  }
}
