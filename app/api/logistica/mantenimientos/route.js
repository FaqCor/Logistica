import { sql } from '@/lib/db';
import { conRol, ok, fail, num, LOGISTICA } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const GET = conRol(LOGISTICA, async () => {
  const mantenimientos = await sql`
    SELECT id, patente, tipo::text AS tipo, estado::text AS estado, descripcion,
           fecha_programada::text AS fecha_programada, km_programado,
           fecha_realizada::text AS fecha_realizada, km_realizado, taller, costo::float8 AS costo
      FROM mantenimientos
     ORDER BY (estado = 'programado') DESC, COALESCE(fecha_programada, fecha_realizada) DESC
     LIMIT 80`;
  return ok({ mantenimientos });
});

export const POST = conRol(LOGISTICA, async (req) => {
  const b = await req.json();
  if (!b.patente || !b.tipo || !String(b.descripcion || '').trim()) return fail('Completá patente, tipo y descripción');
  await sql`
    INSERT INTO mantenimientos (patente, tipo, descripcion, fecha_programada, km_programado)
    VALUES (${b.patente}, ${b.tipo}, ${String(b.descripcion).trim()},
            ${b.fecha_programada || null}::date, ${num(b.km_programado)})`;
  return ok();
});

// Marcar como realizado (el costo pasa a la pestaña Costos de esa patente)
export const PATCH = conRol(LOGISTICA, async (req) => {
  const b = await req.json();
  const costo = num(b.costo);
  if (!b.id || costo == null || costo < 0) return fail('Ingresá el costo del mantenimiento');
  await sql`
    UPDATE mantenimientos
       SET estado = 'realizado',
           fecha_realizada = COALESCE(${b.fecha_realizada || null}::date, CURRENT_DATE),
           km_realizado = ${num(b.km_realizado)}, taller = ${String(b.taller || '').trim() || null}, costo = ${costo}
     WHERE id = ${Number(b.id)}`;
  return ok();
});
