import { getSupabaseContext, json, parseJsonBody, reviewCreateSchema } from '../_lib'

const REVIEW_SELECT = `
  *,
  reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, username, avatar_url, campus),
  reviewee:profiles!reviews_reviewee_id_fkey(id, full_name, username, avatar_url, campus),
  order:orders!reviews_order_id_fkey(id, status, price, quantity, completed_at)
`

export async function GET(request: Request) {
  const { supabase } = await getSupabaseContext()
  const url = new URL(request.url)
  const revieweeId = url.searchParams.get('revieweeId')

  let query = supabase.from('reviews').select(REVIEW_SELECT).order('created_at', { ascending: false })

  if (revieweeId) {
    query = query.eq('reviewee_id', revieweeId)
  }

  const { data, error } = await query

  if (error) {
    return json({ error: error.message }, 500)
  }

  return json({ data })
}

export async function POST(request: Request) {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const body = await parseJsonBody(request, reviewCreateSchema)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, buyer_id, seller_id, status')
    .eq('id', body.orderId)
    .maybeSingle()

  if (orderError) {
    return json({ error: orderError.message }, 500)
  }

  if (!order || (order.buyer_id !== user.id && order.seller_id !== user.id)) {
    return json({ error: 'Order not found' }, 404)
  }

  if (order.status !== 'completed') {
    return json({ error: 'Only completed orders can be reviewed' }, 400)
  }

  const revieweeId = order.buyer_id === user.id ? order.seller_id : order.buyer_id

  if (revieweeId === user.id) {
    return json({ error: 'You cannot review yourself' }, 400)
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      order_id: body.orderId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating: body.rating,
      comment: body.comment,
    })
    .select(REVIEW_SELECT)
    .single()

  if (error || !data) {
    return json({ error: error?.message ?? 'Unable to create review' }, 400)
  }

  return json({ data }, 201)
}
