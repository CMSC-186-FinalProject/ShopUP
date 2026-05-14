import { createClient as createSupabaseClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const listingConditionValues = ['like_new', 'good', 'fair', 'for_parts'] as const
export const listingStatusValues = ['draft', 'active', 'sold', 'archived'] as const
export const orderStatusValues = ['pending', 'completed', 'cancelled', 'refunded'] as const

export const listingImageInputSchema = z.object({
  imageUrl: z.string().url(),
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export const listingCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  price: z.coerce.number().min(0),
  condition: z.string().trim().min(1),
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().trim().min(1).optional(),
  categoryName: z.string().trim().min(1).optional(),
  location: z.string().trim().max(120).optional().nullable(),
  campus: z.string().trim().max(120).optional().nullable(),
  status: z.string().trim().optional(),
  images: z.array(listingImageInputSchema).default([]),
})

export const listingUpdateSchema = listingCreateSchema.partial()

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  campus: z.string().trim().min(1).max(120).optional(),
  bio: z.string().trim().max(500).nullable().optional(),
})

export const favoriteCreateSchema = z.object({
  listingId: z.string().uuid(),
})

export const conversationCreateSchema = z.object({
  listingId: z.string().uuid(),
})

export const messageCreateSchema = z.object({
  body: z.string().trim().min(1).max(2000),
})

export const orderCreateSchema = z.object({
  listingId: z.string().uuid(),
})

export const orderUpdateSchema = z.object({
  status: z.string().trim().min(1),
})

export const reviewCreateSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().default(''),
})

export const LISTING_SELECT = `
  *,
  seller:profiles!listings_seller_id_fkey(id, full_name, username, avatar_url, campus),
  category:categories!listings_category_id_fkey(id, name, slug),
  images:listing_images(id, image_url, sort_order)
`

export async function getSupabaseContext() {
  const cookieStore = await cookies()
  const supabase = createSupabaseClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user }
}

export async function parseJsonBody<T>(request: Request, schema: z.ZodType<T>) {
  const body = await request.json().catch(() => null)
  return schema.parse(body)
}

export async function getRouteParams<T extends Record<string, string | undefined>>(
  context: { params: T | Promise<T> }
) {
  return await Promise.resolve(context.params)
}

export function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === 'number' ? { status: init } : init)
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeListingCondition(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, '_')

  if (normalized === 'like_new' || normalized === 'like_new_item') {
    return 'like_new'
  }

  if (normalized === 'good') {
    return 'good'
  }

  if (normalized === 'fair') {
    return 'fair'
  }

  if (normalized === 'for_parts' || normalized === 'forparts') {
    return 'for_parts'
  }

  return null
}

export function normalizeListingStatus(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, '_')

  if (listingStatusValues.includes(normalized as (typeof listingStatusValues)[number])) {
    return normalized as (typeof listingStatusValues)[number]
  }

  return null
}

export function formatListingRow<Row extends { images?: Array<{ sort_order?: number | null }> }>(row: Row) {
  return {
    ...row,
    images: Array.isArray(row.images)
      ? [...row.images].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
      : [],
  }
}

export async function attachSellerRatings<Row extends { seller?: { id?: string | null } }>(
  supabase: Awaited<ReturnType<typeof getSupabaseContext>>['supabase'],
  rows: Row[]
) {
  const sellerIds = Array.from(
    new Set(rows.map((row) => row.seller?.id).filter((sellerId): sellerId is string => Boolean(sellerId)))
  )

  if (sellerIds.length === 0) {
    return rows.map((row) => ({
      ...row,
      seller_rating: null,
    }))
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('reviewee_id, rating')
    .in('reviewee_id', sellerIds)

  if (error) {
    return rows.map((row) => ({
      ...row,
      seller_rating: null,
    }))
  }

  const ratingMap = new Map<string, { sum: number; count: number }>()

  for (const review of data ?? []) {
    const current = ratingMap.get(review.reviewee_id) ?? { sum: 0, count: 0 }
    ratingMap.set(review.reviewee_id, {
      sum: current.sum + Number(review.rating ?? 0),
      count: current.count + 1,
    })
  }

  return rows.map((row) => {
    const sellerId = row.seller?.id

    if (!sellerId) {
      return {
        ...row,
        seller_rating: null,
      }
    }

    const aggregate = ratingMap.get(sellerId)

    return {
      ...row,
      seller_rating: aggregate && aggregate.count > 0 ? Number((aggregate.sum / aggregate.count).toFixed(1)) : null,
    }
  })
}

async function resolveCategoryBySlug(supabase: Awaited<ReturnType<typeof getSupabaseContext>>['supabase'], slug: string) {
  const { data, error } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()

  if (error || !data) {
    return null
  }

  return data.id as number
}

async function resolveCategoryByName(supabase: Awaited<ReturnType<typeof getSupabaseContext>>['supabase'], name: string) {
  const { data, error } = await supabase.from('categories').select('id').ilike('name', name).maybeSingle()

  if (error || !data) {
    return null
  }

  return data.id as number
}

export async function resolveCategoryId(
  supabase: Awaited<ReturnType<typeof getSupabaseContext>>['supabase'],
  category: { categoryId?: string; categorySlug?: string; categoryName?: string }
) {
  if (category.categoryId) {
    return category.categoryId
  }

  if (category.categorySlug) {
    const categoryId = await resolveCategoryBySlug(supabase, normalizeSlug(category.categorySlug))
    if (categoryId) return String(categoryId)
  }

  if (category.categoryName) {
    const categoryId = await resolveCategoryByName(supabase, category.categoryName.trim())
    if (categoryId) return String(categoryId)
  }

  return null
}

export async function syncListingImages(
  supabase: Awaited<ReturnType<typeof getSupabaseContext>>['supabase'],
  listingId: string,
  images: Array<{ imageUrl: string; sortOrder?: number }>
) {
  await supabase.from('listing_images').delete().eq('listing_id', listingId)

  if (images.length === 0) {
    return
  }

  await supabase.from('listing_images').insert(
    images.map((image, index) => ({
      listing_id: listingId,
      image_url: image.imageUrl,
      sort_order: image.sortOrder ?? index,
    }))
  )
}
