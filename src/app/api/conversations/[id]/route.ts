import { getRouteParams, getSupabaseContext, json, LISTING_SELECT, formatListingRow } from '../../_lib'

const CONVERSATION_SELECT = `
  *,
  listing:listings!conversations_listing_id_fkey(${LISTING_SELECT}),
  buyer:profiles!conversations_buyer_id_fkey(id, full_name, username, avatar_url, campus),
  seller:profiles!conversations_seller_id_fkey(id, full_name, username, avatar_url, campus)
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
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('id', id)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .maybeSingle()

  if (error) {
    return json({ error: error.message }, 500)
  }

  if (!data) {
    return json({ error: 'Conversation not found' }, 404)
  }

  return json({
    data: {
      ...data,
      listing: data.listing ? formatListingRow(data.listing) : null,
    },
  })
}
