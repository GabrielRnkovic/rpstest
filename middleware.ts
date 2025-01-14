import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Make cookies work with custom domains
  response.headers.set('Set-Cookie-Allow-Origin', '*');
  
  return response;
}
