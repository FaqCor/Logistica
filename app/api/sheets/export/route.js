import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Lo consume el Google Apps Script. Protegido con SHEETS_TOKEN.
export async function GET(req) {
  const token = new URL(req.url).searchParams.get('token');
  if (!process.env.SHEETS_TOKEN || token !== process.env.SHEETS_TOKEN)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const costos = await sql`
    SELECT patente, fecha::text AS fecha, concepto, monto::float8 AS monto, detalle
      FROM v_costos_por_patente ORDER BY patente, fecha`;
  const resumen = await sql`
    SELECT patente, mes::text AS mes, costo_total::float8 AS costo_total
      FROM v_resumen_patente_mes ORDER BY patente, mes`;
  const cobros = await sql`
    SELECT fecha::text AS fecha, patente, cliente, nro_pedido, orden, medio::text AS medio,
           monto::float8 AS monto, referencia
      FROM v_cobros_detalle WHERE fecha >= current_date - 90`;
  const pedidos = await sql`
    SELECT fecha_programada::text AS fecha, patente, chofer, nro_pedido, cliente, direccion,
           estado::text AS estado, motivo_no_entrega, monto_a_cobrar::float8 AS monto
      FROM v_pedidos_dia WHERE fecha_programada >= current_date - 60`;

  return NextResponse.json({ costos, resumen, cobros, pedidos });
}
