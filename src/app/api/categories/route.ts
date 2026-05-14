import { getSupabaseContext, json } from '../_lib'

export async function GET() {
  const { supabase } = await getSupabaseContext()

  const [{ data: categories, error: categoriesError }, { data: activeListings, error: listingsError }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, description, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase
      .from('listings')
      .select('category_id')
      .eq('status', 'active'),
  ])

  if (categoriesError) {
    return json({ error: categoriesError.message }, 500)
  }

  if (listingsError) {
    return json({ error: listingsError.message }, 500)
  }

  const counts = new Map<number, number>()

  for (const listing of activeListings ?? []) {
    if (listing.category_id) {
      counts.set(listing.category_id, (counts.get(listing.category_id) ?? 0) + 1)
    }
  }

  const data = (categories ?? []).map((category) => ({
    ...category,
    count: counts.get(category.id) ?? 0,
  }))

  return json({ data })
}
