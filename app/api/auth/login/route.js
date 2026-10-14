import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { crearSesion, destinoPorRol } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const [u] = await sql`
      SELECT id, email, password_hash, rol FROM usuarios
       WHERE email = ${String(email || '').trim().toLowerCase()} AND activo`;
    const valido = u && (await bcrypt.compare(String(password || ''), u.password_hash));
    if (!valido) return fail('Email o contraseña incorrectos', 401);
    await crearSesion({ uid: Number(u.id), rol: u.rol, email: u.email });
    return ok({ destino: destinoPorRol(u.rol) });
  } catch (e) {
    console.error(e);
    return fail('No se pudo iniciar sesión', 500);
  }
}
