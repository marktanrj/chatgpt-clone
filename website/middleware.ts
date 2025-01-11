import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = [
  '/chat',
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const sessionCookie = request.cookies.get('sessionId')?.value
  
  const isProtectedRoute = protectedRoutes.some(route => 
    path.startsWith(route)
  )

  // if protected route and has sessionId, validate it with backend
  if (isProtectedRoute && sessionCookie) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Cookie: `sessionId=${sessionCookie}`
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        // invalid session - clear cookie and redirect
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('sessionId')
        return response
      }
    } catch {
      // API error - redirect to login?
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('sessionId')
      return response
    }
  }

  // handle redirects for unauthenticated users
  if ((isProtectedRoute || path === '/') && !sessionCookie) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  // redirect authenticated users away from login
  if (['/login', '/'].includes(path) && sessionCookie) {
    console.log('etst');
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/sign-up',
    '/chat',
    '/chat/:path*'
  ]
}