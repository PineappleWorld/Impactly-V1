import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // For admin routes, we'll let the page component handle the authentication
  // This middleware just ensures the route exists
  // The actual auth check happens in the page component to avoid issues with server-side session handling
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
