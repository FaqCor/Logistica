import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const COOKIE = 'sesion';
const clave = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function crearSesion(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(clave());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export async function sesionActual() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, clave());
    return payload;
  } catch {
    return null;
  }
}

export function borrarSesion() {
  cookies().delete(COOKIE);
}

// Devuelve la sesión si el rol está permitido; si no, null
export async function exigir(roles) {
  const s = await sesionActual();
  return s && roles.includes(s.rol) ? s : null;
}

export const destinoPorRol = (rol) => (rol === 'chofer' ? '/chofer' : '/logistica');
