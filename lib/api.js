import { NextResponse } from 'next/server';
import { exigir } from './auth';

export const ok = (data = {}) => NextResponse.json(data);
export const fail = (msg, status = 400) => NextResponse.json({ error: msg }, { status });

// Envuelve un handler: valida rol y captura errores
export function conRol(roles, handler) {
  return async (req, ctx) => {
    const sesion = await exigir(roles);
    if (!sesion) return fail('No autorizado', 401);
    try {
      return await handler(req, ctx, sesion);
    } catch (e) {
      console.error(e);
      const msg = String(e?.message || '');
      // Lo levanta el trigger de la base cuando falta el checklist
      if (msg.includes('checklist')) return fail(msg, 409);
      if (e?.code === '23505') return fail('Ya existe un registro con esos datos', 409);
      if (e?.code === '23503') return fail('Hay un dato relacionado que no existe', 400);
      return fail('Error interno del servidor', 500);
    }
  };
}

export const LOGISTICA = ['logistica', 'admin'];
export const MEDIOS = ['efectivo', 'transferencia', 'cheque', 'otro'];
export const num = (v) => (v === '' || v == null ? null : Number(v));
