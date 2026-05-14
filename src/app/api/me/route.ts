import { getSupabaseContext, json } from '../_lib'

export async function GET() {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return json({ error: error.message }, 500)
  }

  return json({
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
  })
}
