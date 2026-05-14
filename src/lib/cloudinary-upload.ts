export interface UploadedCloudinaryAsset {
  secureUrl: string
  publicId: string
  width: number | null
  height: number | null
  format: string | null
  bytes: number | null
}

export async function uploadToCloudinary(file: File, folder: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await fetch('/api/uploads/cloudinary', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload
      ? String((payload as { error?: unknown }).error ?? 'Upload failed')
      : 'Upload failed'

    throw new Error(message)
  }

  return payload.data as UploadedCloudinaryAsset
}
