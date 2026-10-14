import { sql } from '@/lib/db';
import { conRol, ok, fail, LOGISTICA } from '@/lib/api';
import { urlMapa } from '@/lib/ruta';

export const POST = conRol(LOGISTICA, async (_req, { params }) => {
  const id = Number(params.id);
  const [ruta] = await sql`SELECT id FROM rutas WHERE id = ${id}`;
  if (!ruta) return fail('Ruta no encontrada', 404);

  const pedidos = await sql`
    SELECT p.id::int AS id,
           d.direccion || COALESCE(', ' || d.localidad, '') || COALESCE(', ' || d.provincia, '') AS direccion
      FROM pedidos p JOIN direcciones_cliente d ON d.id = p.direccion_id
     WHERE p.ruta_id = ${id}
     ORDER BY COALESCE(p.orden_en_ruta, 999), p.id`;
  if (!pedidos.length) return fail('La ruta no tiene pedidos para optimizar');

  const origen = process.env.DEPOSITO_DIRECCION || '';
  const volver = Boolean(origen) && process.env.RUTA_VOLVER_AL_DEPOSITO !== 'false';
  let orden = pedidos.map((p) => p.id);
  let fuente = 'manual';
  let km = null;
  let minutos = null;

  if (process.env.APPS_SCRIPT_URL && origen) {
    // Google Apps Script resuelve el orden óptimo con el servicio Maps
    const res = await fetch(process.env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: process.env.APPS_SCRIPT_TOKEN, origen, volver, paradas: pedidos }),
    });
    const out = await res.json().catch(() => ({ error: 'respuesta inválida' }));
    if (out.error) return fail('Optimizador de rutas: ' + out.error, 502);
    orden = out.orden.map(Number);
    km = out.km ?? null;
    minutos = out.minutos ?? null;
    fuente = 'google';
  }

  const porId = new Map(pedidos.map((p) => [p.id, p.direccion]));
  const direcciones = orden.map((pid) => porId.get(pid)).filter(Boolean);
  const url = urlMapa(origen, direcciones);

  await sql.transaction([
    sql`UPDATE pedidos p SET orden_en_ruta = o.ord::int
          FROM jsonb_array_elements_text(${JSON.stringify(orden)}::jsonb) WITH ORDINALITY AS o(pid, ord)
         WHERE p.id = o.pid::bigint AND p.ruta_id = ${id}`,
    sql`UPDATE rutas
           SET url_mapa = ${url}, ruta_optimizada = ${JSON.stringify({ orden, fuente, km, minutos })}::jsonb
         WHERE id = ${id}`,
  ]);
  return ok({ fuente, km, minutos, url_mapa: url });
});
