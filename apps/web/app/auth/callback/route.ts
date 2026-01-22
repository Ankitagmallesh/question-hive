import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '../../utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  


  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'

      // If we have a specific "next" destination (like reset-password), go there.
      if (next) {
          // Use origin to ensure we stay on the same domain (localhost or production)
          return NextResponse.redirect(`${origin}${next}`)
      }

      // Check for recovery flow (password reset)
      const type = searchParams.get('type')
      if (type === 'recovery') {
          return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      
      // Default success redirect
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/home`)
      } else {
        // User requested hardcoded redirect to production URL for production
        // But better to use origin or forwarded host if available to avoid protocol issues?
        // Staying consistent with request:
        return NextResponse.redirect(`https://questionhiveai.vercel.app/home`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
