import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from './utils/session'

export async function middleware(request: NextRequest) {
    // Allow API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next()
    }

    // Check for bypass in development
    if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
        return NextResponse.next()
    }

    try {
        const session = await getSession()
        
        // If no session and not on home page, redirect to home
        if (!session && request.nextUrl.pathname !== '/') {
            return NextResponse.redirect(new URL('/', request.url))
        }
        
        return NextResponse.next()
    } catch (error) {
        console.error('Middleware error:', error)
        return NextResponse.redirect(new URL('/', request.url))
    }
}

export const config = {
    matcher: ['/((?!_next/static|favicon.ico).*)'],
}