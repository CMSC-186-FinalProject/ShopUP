import { getRouteParams, getSupabaseContext, json, orderUpdateSchema, parseJsonBody } from '../../_lib'

const ORDER_SELECT = `
  *,
  listing:listings!orders_listing_id_fkey(*),
  buyer:profiles!orders_buyer_id_fkey(id, full_name, username, avatar_url, campus),
  seller:profiles!orders_seller_id_fkey(id, full_name, username, avatar_url, campus)
`

export async function GET(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { id } = await getRouteParams(context)

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', id)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .maybeSingle()

  if (error) {
    return json({ error: error.message }, 500)
  }

  if (!data) {
    return json({ error: 'Order not found' }, 404)
  }

  return json({ data })
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
  const body = await parseJsonBody(request, orderUpdateSchema)

  const { data: existingOrder, error: existingOrderError } = await supabase
    .from('orders')
    .select('id, buyer_id, seller_id')
    .eq('id', id)
    .maybeSingle()

  if (existingOrderError) {
    return json({ error: existingOrderError.message }, 500)
  }

  if (!existingOrder || (existingOrder.buyer_id !== user.id && existingOrder.seller_id !== user.id)) {
    return json({ error: 'Order not found' }, 404)
  }

  const updates: Record<string, unknown> = { status: body.status }

  if (body.status === 'completed') {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select(ORDER_SELECT)
    .single()

  if (error || !data) {
    return json({ error: error?.message ?? 'Unable to update order' }, 400)
  }

  return json({ data })
}
