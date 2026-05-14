'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Slider } from '@/src/components/ui/slider'
import { getCroppedImage } from '@/src/lib/crop-image'

interface AvatarCropDialogProps {
  open: boolean
  imageSrc: string | null
  fileName: string | null
  onOpenChange: (open: boolean) => void
  onCropComplete: (file: File) => Promise<void> | void
}

export function AvatarCropDialog({
  open,
  imageSrc,
  fileName,
  onOpenChange,
  onCropComplete,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      setIsSaving(false)
    }
  }, [open])

  const cropHint = useMemo(() => 'Drag to reposition. Use the slider to zoom.', [])

  const onCropCompleteHandler = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !fileName) {
      return
    }

    setIsSaving(true)

    try {
      const croppedFile = await getCroppedImage(imageSrc, croppedAreaPixels, fileName)
      await onCropComplete(croppedFile)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" showCloseButton={!isSaving}>
        <DialogHeader>
          <DialogTitle>Crop avatar</DialogTitle>
          <DialogDescription>{cropHint}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative h-85 w-full overflow-hidden rounded-xl bg-muted">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropCompleteHandler}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={(values) => setZoom(values[0] ?? 1)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving || !imageSrc}>
            {isSaving ? 'Saving...' : 'Use cropped image'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
