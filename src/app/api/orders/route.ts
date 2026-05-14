import {
  getSupabaseContext,
  json,
  orderCreateSchema,
  orderStatusValues,
  parseJsonBody,
  LISTING_SELECT,
  formatListingRow,
} from '../_lib'

const ORDER_SELECT = `
  *,
  listing:listings!orders_listing_id_fkey(${LISTING_SELECT}),
  buyer:profiles!orders_buyer_id_fkey(id, full_name, username, avatar_url, campus),
  seller:profiles!orders_seller_id_fkey(id, full_name, username, avatar_url, campus)
`

export async function GET() {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    return json({ error: error.message }, 500)
  }

  const orders = (data ?? []).map((order) => ({
    ...order,
    listing: order.listing ? formatListingRow(order.listing) : null,
  }))

  return json({ data: orders })
}

export async function POST(request: Request) {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const body = await parseJsonBody(request, orderCreateSchema)

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, seller_id, price, status')
    .eq('id', body.listingId)
    .maybeSingle()

  if (listingError) {
    return json({ error: listingError.message }, 500)
  }

  if (!listing) {
    return json({ error: 'Listing not found' }, 404)
  }

  if (listing.seller_id === user.id) {
    return json({ error: 'Sellers cannot order their own listing' }, 400)
  }

  if (listing.status !== 'active') {
    return json({ error: 'Only active listings can be ordered' }, 400)
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      status: 'pending',
      price: listing.price,
      quantity: 1,
    })
    .select(ORDER_SELECT)
    .single()

  if (error || !data) {
    return json({ error: error?.message ?? 'Unable to create order' }, 400)
  }

  return json({
    data: {
      ...data,
      listing: data.listing ? formatListingRow(data.listing) : null,
    },
  }, 201)
}
