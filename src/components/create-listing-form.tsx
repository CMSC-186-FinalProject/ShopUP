'use client'

import { useState } from 'react'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Badge } from '@/src/components/ui/badge'
import { Upload, X } from 'lucide-react'

const CATEGORIES = [
  'Textbooks',
  'Electronics',
  'Clothing',
  'Furniture',
  'Sports',
  'Books',
  'Notes',
  'Other',
]

const CONDITIONS = ['Like New', 'Good', 'Fair', 'For Parts']

interface CreateListingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateListingForm({ open, onOpenChange }: CreateListingFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Reset form
    setFormData({ title: '', description: '', price: '', category: '', condition: '', images: [] })
    setSelectedCategory(null)
    setSelectedCondition(null)
    onOpenChange(false)
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
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Badge
                    key={cat}
                    variant={
                      selectedCategory === cat ? 'default' : 'outline'
                    }
                    className="cursor-pointer py-1.5 px-2.5"
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
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
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Create Listing
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
