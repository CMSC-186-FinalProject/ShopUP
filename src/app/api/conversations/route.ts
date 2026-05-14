import {
  conversationCreateSchema,
  formatListingRow,
  getSupabaseContext,
  json,
  parseJsonBody,
  LISTING_SELECT,
} from '../_lib'

const CONVERSATION_SELECT = `
  *,
  listing:listings!conversations_listing_id_fkey(${LISTING_SELECT}),
  buyer:profiles!conversations_buyer_id_fkey(id, full_name, username, avatar_url, campus),
  seller:profiles!conversations_seller_id_fkey(id, full_name, username, avatar_url, campus)
`

export async function GET() {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    return json({ error: error.message }, 500)
  }

  const conversations = (data ?? []).map((conversation) => ({
    ...conversation,
    listing: conversation.listing ? formatListingRow(conversation.listing) : null,
  }))

  return json({ data: conversations })
}

export async function POST(request: Request) {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const body = await parseJsonBody(request, conversationCreateSchema)

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, seller_id')
    .eq('id', body.listingId)
    .maybeSingle()

  if (listingError) {
    return json({ error: listingError.message }, 500)
  }

  if (!listing) {
    return json({ error: 'Listing not found' }, 404)
  }

  if (listing.seller_id === user.id) {
    return json({ error: 'Sellers cannot start conversations with their own listing' }, 400)
  }

  const { data: existingConversation } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('listing_id', body.listingId)
    .eq('buyer_id', user.id)
    .maybeSingle()

  if (existingConversation) {
    return json({
      data: {
        ...existingConversation,
        listing: existingConversation.listing ? formatListingRow(existingConversation.listing) : null,
      },
    })
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      listing_id: body.listingId,
      buyer_id: user.id,
      seller_id: listing.seller_id,
    })
    .select(CONVERSATION_SELECT)
    .single()

  if (error || !data) {
    return json({ error: error?.message ?? 'Unable to create conversation' }, 400)
  }

  return json({
    data: {
      ...data,
      listing: data.listing ? formatListingRow(data.listing) : null,
    },
  }, 201)
}
