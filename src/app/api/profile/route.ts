import { getSupabaseContext, json, profileUpdateSchema } from '../_lib'

export async function GET() {
  const { supabase, user } = await getSupabaseContext()

  if (!user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return json({ error: error.message }, 500)
  }

  if (!data) {
    return json({ error: 'Profile not found' }, 404)
  }

  return json({ data })
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await getSupabaseContext()

    if (!user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const rawBody = await request.json().catch(() => null)
    const parsed = profileUpdateSchema.safeParse(rawBody)

    if (!parsed.success) {
      return json(
        {
          error: parsed.error.issues[0]?.message ?? 'Invalid profile data',
        },
        400
      )
    }

    const body = parsed.data
    const updates: Record<string, unknown> = {}

    if (body.fullName !== undefined) {
      const trimmed = body.fullName.trim()
      if (trimmed) updates.full_name = trimmed
    }

    if (body.username !== undefined) {
      const trimmed = body.username.trim()
      if (trimmed) updates.username = trimmed
    }

    if (body.avatarUrl !== undefined) updates.avatar_url = body.avatarUrl
    if (body.campus !== undefined) {
      const trimmed = body.campus.trim()
      if (trimmed) updates.campus = trimmed
    }

    if (body.bio !== undefined) updates.bio = body.bio

    if (Object.keys(updates).length === 0) {
      return json({ error: 'No profile changes provided' }, 400)
    }

    const { data: currentProfile, error: profileReadError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileReadError) {
      return json({ error: profileReadError.message }, 500)
    }

    const nextProfile = {
      id: user.id,
      full_name: currentProfile?.full_name ?? '',
      username: currentProfile?.username ?? null,
      avatar_url: currentProfile?.avatar_url ?? null,
      campus: currentProfile?.campus ?? 'UP Mindanao',
      bio: currentProfile?.bio ?? null,
      ...updates,
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(nextProfile, { onConflict: 'id' })
      .select('*')
      .maybeSingle()

    if (error) {
      return json({ error: error.message }, 400)
    }

    if (!data) {
      return json({ error: 'Unable to save profile' }, 500)
    }

    return json({ data })
  } catch (error: unknown) {
    return json(
      {
        error: error instanceof Error ? error.message : 'Unable to update profile',
      },
      500
    )
  }
}
