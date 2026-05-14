import { getRouteParams, getSupabaseContext, json } from '../../_lib'

export async function DELETE(
  request: Request,
  context: { params: { listingId: string } | Promise<{ listingId: string }> }
) {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { listingId } = await getRouteParams(context)

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listingId)

  if (error) {
    return json({ error: error.message }, 400)
  }

  return json({ ok: true })
}
