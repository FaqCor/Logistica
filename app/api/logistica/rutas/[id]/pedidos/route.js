import { sql } from '@/lib/db';
import { conRol, ok, fail, LOGISTICA } from '@/lib/api';

// Asignar pedidos a la ruta
export const POST = conRol(LOGISTICA, async (req, { params }) => {
  const id = Number(params.id);
  const ids = ((await req.json()).pedido_ids || []).map(Number).filter(Boolean);
  if (!ids.length) return fail('Elegí al menos un pedido');
  const [r] = await sql`SELECT estado FROM rutas WHERE id = ${id}`;
  if (!r) return fail('Ruta no encontrada', 404);
  if (r.estado === 'finalizada' || r.estado === 'cancelada') return fail('La ruta ya está cerrada', 409);
  await sql.transaction([
    sql`UPDATE pedidos p
           SET ruta_id = ${id},
               orden_en_ruta = (SELECT COALESCE(MAX(orden_en_ruta), 0) FROM pedidos WHERE ruta_id = ${id}) + x.n
          FROM (SELECT v.id::bigint AS id, v.n
                  FROM jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb) WITH ORDINALITY AS v(id, n)) x
         WHERE p.id = x.id AND p.ruta_id IS NULL`,
    sql`UPDATE rutas SET url_mapa = NULL, ruta_optimizada = NULL WHERE id = ${id}`,
  ]);
  return ok();
});

// Quitar un pedido de la ruta
export const DELETE = conRol(LOGISTICA, async (req, { params }) => {
  const id = Number(params.id);
  const pedidoId = Number((await req.json()).pedido_id);
  await sql.transaction([
    sql`UPDATE pedidos SET ruta_id = NULL, orden_en_ruta = NULL
         WHERE id = ${pedidoId} AND ruta_id = ${id} AND estado = 'pendiente'`,
    sql`UPDATE rutas SET url_mapa = NULL, ruta_optimizada = NULL WHERE id = ${id}`,
  ]);
  return ok();
});
