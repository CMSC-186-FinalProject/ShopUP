import {
  attachSellerRatings,
  getSupabaseContext,
  json,
  listingCreateSchema,
  normalizeListingCondition,
  normalizeListingStatus,
  parseJsonBody,
  resolveCategoryId,
  syncListingImages,
  LISTING_SELECT,
  formatListingRow,
} from '../_lib'
import { formatValidationIssues } from '@/src/lib/validation-format'

export async function GET(request: Request) {
  const { supabase } = await getSupabaseContext()
  const url = new URL(request.url)

  const search = url.searchParams.get('search')?.trim().toLowerCase() ?? ''
  const status = url.searchParams.get('status')
  const categoryId = url.searchParams.get('categoryId')
  const sellerId = url.searchParams.get('sellerId')
  const sort = url.searchParams.get('sort') ?? 'newest'
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 24), 100)
  const offset = Number(url.searchParams.get('offset') ?? 0)

  let query = supabase.from('listings').select(LISTING_SELECT)

  if (status) {
    const normalizedStatus = normalizeListingStatus(status)
    if (normalizedStatus) {
      query = query.eq('status', normalizedStatus)
    }
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (sellerId) {
    query = query.eq('seller_id', sellerId)
  }

  if (sort === 'price-low') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price-high') {
    query = query.order('price', { ascending: false })
  } else if (sort === 'popular') {
    query = query.order('views_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    return json({ error: error.message }, 500)
  }

  const rows = (data ?? []).map((row) => formatListingRow(row))

  const filteredRows = search
    ? rows.filter((row) => {
        const haystack = [row.title, row.description, row.category?.name, row.seller?.full_name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return haystack.includes(search)
      })
    : rows

    const rowsWithRatings = await attachSellerRatings(supabase, filteredRows)

    return json({ data: rowsWithRatings })
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getSupabaseContext()

    if (!user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const body = await parseJsonBody(request, listingCreateSchema)
    const condition = normalizeListingCondition(body.condition)

    if (!condition) {
      return json({ error: 'Invalid listing condition' }, 400)
    }

    const categoryId = await resolveCategoryId(supabase, body)

    if (!categoryId) {
      return json({ error: 'Category not found' }, 400)
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        category_id: categoryId,
        title: body.title,
        description: body.description,
        price: body.price,
        condition,
        status: normalizeListingStatus(body.status ?? '') ?? 'active',
        location: body.location ?? null,
        campus: body.campus ?? 'UP Mindanao',
      })
      .select(LISTING_SELECT)
      .single()

    if (error || !listing) {
      const message = error && typeof error === 'object' && 'message' in error ? String((error as any).message ?? error) : 'Unable to create listing'
      console.error('POST /api/listings insert error:', error)
      return json({ error: message }, 400)
    }

    try {
      await syncListingImages(supabase, listing.id, body.images)
    } catch (imgErr) {
      // Log image sync errors but don't fail the entire request; return the listing anyways.
      console.error('syncListingImages failed for listing', listing.id, imgErr)
    }

    const { data: listingWithImages, error: fetchError } = await supabase
      .from('listings')
      .select(LISTING_SELECT)
      .eq('id', listing.id)
      .single()

    if (fetchError || !listingWithImages) {
      console.warn('Could not re-fetch listing after create, returning created row:', fetchError)
      return json({ data: formatListingRow(listing) }, 201)
    }

    const [rowWithRating] = await attachSellerRatings(supabase, [formatListingRow(listingWithImages)])

    return json({ data: rowWithRating }, 201)
  } catch (err: unknown) {
    // If this is a Zod validation error, return a 400 with friendly messages and issues.
    try {
      if (err && typeof err === 'object') {
        const asAny = err as any

        // ZodError has an `issues` array
        if (Array.isArray(asAny.issues)) {
          const issues = asAny.issues as Array<{ path?: Array<string | number>; message?: string }>
          const formatted = formatValidationIssues(issues)

          console.warn('Validation error in POST /api/listings:', issues)
          return json({ error: formatted, issues }, 400)
        }

        // Some code may throw an array of issues directly
        if (Array.isArray(asAny) && asAny.length > 0 && typeof asAny[0] === 'object' && 'message' in asAny[0]) {
          const issues = asAny as Array<{ path?: Array<string | number>; message?: string }>
          const formatted = formatValidationIssues(issues)

          console.warn('Validation error array in POST /api/listings:', issues)
          return json({ error: formatted, issues }, 400)
        }
      }
    } catch (formatErr) {
      console.warn('Error while formatting validation error:', formatErr)
    }

    // Avoid mutating error objects from libraries; coerce to string and log.
    console.error('Unhandled exception in POST /api/listings:', err)
    const message = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err)
    return json({ error: message }, 500)
  }
}
