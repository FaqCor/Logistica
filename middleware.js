import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const token = req.cookies.get('sesion')?.value;
  let sesion = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      sesion = payload;
    } catch {}
  }
  const ruta = req.nextUrl.pathname;
  if (!sesion) return NextResponse.redirect(new URL('/login', req.url));
  if (ruta.startsWith('/chofer') && sesion.rol !== 'chofer')
    return NextResponse.redirect(new URL('/logistica', req.url));
  if (ruta.startsWith('/logistica') && sesion.rol === 'chofer')
    return NextResponse.redirect(new URL('/chofer', req.url));
  return NextResponse.next();
}

export const config = { matcher: ['/chofer/:path*', '/logistica/:path*'] };
