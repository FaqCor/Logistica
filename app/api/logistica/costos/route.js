import { sql } from '@/lib/db';
import { conRol, ok, LOGISTICA } from '@/lib/api';

export const dynamic = 'force-dynamic';

// ?mes=YYYY-MM  -> costos por patente (viáticos + gastos + mantenimientos realizados)
export const GET = conRol(LOGISTICA, async (req) => {
  const hoy = new Date().toISOString().slice(0, 7);
  const mes = new URL(req.url).searchParams.get('mes') || hoy;
  const desde = `${mes}-01`;
  const filas = await sql`
    SELECT patente, fecha::text AS fecha, concepto, monto::float8 AS monto, detalle
      FROM v_costos_por_patente
     WHERE fecha >= ${desde}::date AND fecha < (${desde}::date + interval '1 month')
     ORDER BY patente, fecha`;
  const cobros = await sql`
    SELECT patente, SUM(total_cobrado)::float8 AS cobrado FROM cobros
     WHERE creado_en >= ${desde}::date AND creado_en < (${desde}::date + interval '1 month')
     GROUP BY patente`;
  return ok({ mes, filas, cobros });
});
