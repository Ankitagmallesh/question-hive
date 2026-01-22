import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  
  // Debug Log
  console.log('Middleware checking path:', url.pathname, 'User ID:', user?.id);

  const path = url.pathname.toLowerCase();
  
  // Define Public Paths
  // /auth/* -> Login/Register/Callback
  // / -> Landing Page
  // /public/* -> Any public assets or pages
  // /api/public/* -> Public APIs
  const isPublicPath = 
      path === '/' ||
      path.startsWith('/auth') ||
      path.startsWith('/public') ||
      path.startsWith('/api/public') || 
      path === '/about' || 
      path === '/pricing' ||
      path === '/privacy' ||
      path === '/terms' ||
      path === '/legal' ||
      // Explicitly allow auth routes
      path === '/auth/login' ||
      path === '/auth/register';

  // If NO user and trying to access protected route -> Redirect to Register
  if (
    !user &&
    !isPublicPath
  ) {
    // Check if it's an API route - return 401 instead of HTML redirect
    if (url.pathname.startsWith('/api/')) {
       // Allow auth APIs
       if (!url.pathname.startsWith('/api/auth')) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }
    } else {
        url.pathname = '/auth/register'
        return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new Response object with NextResponse.redirect() or NextResponse.next(),
  // make sure to:
  // 1. Copy the request cookies to the new response headers
  // 2. Copy the Supabase auth token to the new response headers
  // The logic above handling redirect returns a fresh response, so we don't return supabaseResponse there.
  
  return supabaseResponse
}
