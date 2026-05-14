import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/confirmation-success'
  const email = searchParams.get('email')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const redirectUrl = new URL(next, origin)

      if (email) {
        redirectUrl.searchParams.set('email', email)
      }

      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
