import {
  favoriteCreateSchema,
  formatListingRow,
  getSupabaseContext,
  json,
  parseJsonBody,
  LISTING_SELECT,
} from '../_lib'

export async function GET() {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { data, error } = await supabase
    .from('favorites')
    .select(`listing:listings!favorites_listing_id_fkey(${LISTING_SELECT})`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return json({ error: error.message }, 500)
  }

  const listings = (data ?? [])
    .map((entry) => entry.listing)
    .filter(Boolean)
    .map((listing) => formatListingRow(listing))

  return json({ data: listings })
}

export async function POST(request: Request) {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const body = await parseJsonBody(request, favoriteCreateSchema)

  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    listing_id: body.listingId,
  })

  if (error) {
    return json({ error: error.message }, 400)
  }

  return json({ ok: true }, 201)
}
