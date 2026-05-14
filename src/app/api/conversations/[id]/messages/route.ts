import {
  getRouteParams,
  getSupabaseContext,
  json,
  messageCreateSchema,
  parseJsonBody,
} from '../../../_lib'

export async function GET(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { id } = await getRouteParams(context)

  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select('id, buyer_id, seller_id')
    .eq('id', id)
    .maybeSingle()

  if (conversationError) {
    return json({ error: conversationError.message }, 500)
  }

  if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
    return json({ error: 'Conversation not found' }, 404)
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, body, read_at, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    return json({ error: error.message }, 500)
  }

  return json({ data })
}

export async function POST(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { id } = await getRouteParams(context)
  const body = await parseJsonBody(request, messageCreateSchema)

  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select('id, buyer_id, seller_id')
    .eq('id', id)
    .maybeSingle()

  if (conversationError) {
    return json({ error: conversationError.message }, 500)
  }

  if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
    return json({ error: 'Conversation not found' }, 404)
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: id,
      sender_id: user.id,
      body: body.body,
    })
    .select('id, conversation_id, sender_id, body, read_at, created_at')
    .single()

  if (error || !data) {
    return json({ error: error?.message ?? 'Unable to send message' }, 400)
  }

  await supabase
    .from('conversations')
    .update({ last_message_at: data.created_at })
    .eq('id', id)

  return json({ data }, 201)
}
