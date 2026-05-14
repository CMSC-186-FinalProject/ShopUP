import { getSupabaseContext, json } from '../_lib'

export async function GET() {
  const { supabase } = await getSupabaseContext()

  const [profilesResult, activeListingsResult, completedOrdersResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
  ])

  if (profilesResult.error) {
    return json({ error: profilesResult.error.message }, 500)
  }

  if (activeListingsResult.error) {
    return json({ error: activeListingsResult.error.message }, 500)
  }

  if (completedOrdersResult.error) {
    return json({ error: completedOrdersResult.error.message }, 500)
  }

  return json({
    data: {
      activeUsers: profilesResult.count ?? 0,
      verifiedStudents: profilesResult.count ?? 0,
      itemsTraded: completedOrdersResult.count ?? 0,
      activeListings: activeListingsResult.count ?? 0,
    },
  })
}
