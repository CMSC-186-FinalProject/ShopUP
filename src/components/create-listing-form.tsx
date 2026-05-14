'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Badge } from '@/src/components/ui/badge'
import { Loader2, Plus, Upload, X } from 'lucide-react'
import { fetchApi } from '@/src/lib/api'
import { getFriendlyErrorMessage } from '@/src/lib/error-messages'
import { uploadToCloudinary } from '@/src/lib/cloudinary-upload'

const CONDITIONS = ['Like New', 'Good', 'Fair', 'For Parts']

interface CategoryOption {
  id: number
  name: string
  slug: string
  description: string | null
  count: number
}

interface CreateListingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateListingForm({ open, onOpenChange, onCreated }: CreateListingFormProps) {
  const listingPhotoInputRef = useRef<HTMLInputElement | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    images: [] as string[],
  })

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      setIsLoadingCategories(true)

      try {
        const response = await fetchApi<{ data: CategoryOption[] }>('/api/categories')

        if (isMounted) {
          setCategories(response.data)
        }
      } catch (error: unknown) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unable to load categories')
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false)
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category)
    setFormData((prev) => ({
      ...prev,
      category: category === selectedCategory ? '' : category,
    }))
  }

  const handleConditionSelect = (condition: string) => {
    setSelectedCondition(condition === selectedCondition ? null : condition)
    setFormData((prev) => ({
      ...prev,
      condition: condition === selectedCondition ? '' : condition,
    }))
  }

  const handleListingPhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    setIsUploadingImages(true)
    setError(null)

    try {
      const uploadedUrls: string[] = []

      for (const file of files) {
        const uploaded = await uploadToCloudinary(file, 'shopup/listings')
        uploadedUrls.push(uploaded.secureUrl)
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }))
      } catch (error: unknown) {
        setError(getFriendlyErrorMessage(error) || 'Unable to upload listing photos')
    } finally {
      setIsUploadingImages(false)
      event.target.value = ''
    }
  }

  const handleRemoveListingPhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void (async () => {
      if (!selectedCondition) {
        setError('Please choose a condition')
        return
      }

      if (!selectedCategory) {
        setError('Please choose a category')
        return
      }

      setIsSubmitting(true)
      setError(null)

      try {
        await fetchApi('/api/listings', {
          method: 'POST',
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            categoryName: selectedCategory,
            condition: selectedCondition,
            status: 'active',
            images: formData.images.map((imageUrl, index) => ({
              imageUrl,
              sortOrder: index,
            })),
          }),
        })

        setFormData({ title: '', description: '', price: '', category: '', condition: '', images: [] })
        setSelectedCategory(null)
        setSelectedCondition(null)
        onCreated?.()
        onOpenChange(false)
      } catch (error: unknown) {
        setError(getFriendlyErrorMessage(error) || 'Unable to create listing')
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Listing</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Item Title *
            </label>
            <Input
              type="text"
              name="title"
              placeholder="e.g., Advanced Calculus Textbook"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Be specific and descriptive
            </p>
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Price (₱) *
              </label>
              <Input
                type="number"
                name="price"
                placeholder="0.00"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Category *
              </label>
              {isLoadingCategories ? (
                <p className="text-sm text-muted-foreground">Loading categories...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.name ? 'default' : 'outline'}
                      className="cursor-pointer py-1.5 px-2.5"
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Condition *
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((cond) => (
                <Badge
                  key={cond}
                  variant={
                    selectedCondition === cond ? 'default' : 'outline'
                  }
                  className="cursor-pointer py-1.5 px-2.5"
                  onClick={() => handleConditionSelect(cond)}
                >
                  {cond}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description *
            </label>
            <textarea
              name="description"
              placeholder="Describe the item, condition, any flaws, etc."
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Photos
            </label>
            <input
              ref={listingPhotoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleListingPhotoSelect}
            />

            <button
              type="button"
              onClick={() => listingPhotoInputRef.current?.click()}
              disabled={isUploadingImages}
              className="w-full rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploadingImages ? (
                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              )}
              <p className="font-medium">Click to upload photos</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, and WEBP up to 10MB each
              </p>
            </button>

            {formData.images.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {formData.images.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="group relative overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={imageUrl}
                      alt={`Listing upload ${index + 1}`}
                      className="h-28 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveListingPhoto(index)}
                      className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground opacity-100 shadow-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
                      aria-label={`Remove listing photo ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => listingPhotoInputRef.current?.click()}
                  className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add more
                </button>
              </div>
            ) : null}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
