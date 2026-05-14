import {
  attachSellerRatings,
  getRouteParams,
  getSupabaseContext,
  json,
  listingUpdateSchema,
  normalizeListingCondition,
  normalizeListingStatus,
  parseJsonBody,
  resolveCategoryId,
  syncListingImages,
  LISTING_SELECT,
  formatListingRow,
} from '../../_lib'

export async function GET(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const { supabase } = await getSupabaseContext()
  const { id } = await getRouteParams(context)

  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return json({ error: error.message }, 500)
  }

  if (!data) {
    return json({ error: 'Listing not found' }, 404)
  }

  const [listingWithRating] = await attachSellerRatings(supabase, [formatListingRow(data)])

  return json({ data: listingWithRating })
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { id } = await getRouteParams(context)
  const body = await parseJsonBody(request, listingUpdateSchema)
  const updates: Record<string, unknown> = {}

  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.price !== undefined) updates.price = body.price

  if (body.condition !== undefined) {
    const condition = normalizeListingCondition(body.condition)
    if (!condition) {
      return json({ error: 'Invalid listing condition' }, 400)
    }

    updates.condition = condition
  }

  if (body.status !== undefined) {
    const status = normalizeListingStatus(body.status)
    if (!status) {
      return json({ error: 'Invalid listing status' }, 400)
    }

    updates.status = status
  }

  if (body.location !== undefined) updates.location = body.location ?? null
  if (body.campus !== undefined) updates.campus = body.campus ?? null

  if (
    body.categoryId !== undefined ||
    body.categorySlug !== undefined ||
    body.categoryName !== undefined
  ) {
    const categoryId = await resolveCategoryId(supabase, body)

    if (!categoryId) {
      return json({ error: 'Category not found' }, 400)
    }

    updates.category_id = categoryId
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', id)
    .eq('seller_id', user.id)
    .select(LISTING_SELECT)
    .maybeSingle()

  if (error) {
    return json({ error: error.message }, 400)
  }

  if (!listing) {
    return json({ error: 'Listing not found' }, 404)
  }

  if (body.images !== undefined) {
    await syncListingImages(supabase, id, body.images)
  }

  const { data: refreshedListing, error: refreshError } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .single()

  if (refreshError || !refreshedListing) {
    const [listingWithRating] = await attachSellerRatings(supabase, [formatListingRow(listing)])

    return json({ data: listingWithRating })
  }

  const [listingWithRating] = await attachSellerRatings(supabase, [formatListingRow(refreshedListing)])

  return json({ data: listingWithRating })
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { id } = await getRouteParams(context)

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) {
    return json({ error: error.message }, 400)
  }

  return json({ ok: true })
}
