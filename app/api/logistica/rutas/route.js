import { sql, hoyAR } from '@/lib/db';
import { conRol, ok, fail, LOGISTICA } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const GET = conRol(LOGISTICA, async (req) => {
  const fecha = new URL(req.url).searchParams.get('fecha') || hoyAR();
  const rutas = await sql`
    SELECT r.id, r.fecha::text AS fecha, r.estado::text AS estado, r.patente,
           r.km_inicio, r.km_fin, r.url_mapa, r.enviada_wsp_en,
           ch.nombre AS chofer_nombre, ch.nombre || ' ' || ch.apellido AS chofer, ch.telefono_wsp,
           COALESCE((SELECT completado FROM checklists WHERE ruta_id = r.id), false) AS checklist_ok,
           COALESCE((SELECT SUM(c.total_cobrado) FROM cobros c JOIN pedidos p ON p.id = c.pedido_id
                      WHERE p.ruta_id = r.id), 0)::float8 AS cobrado,
           COALESCE((
             SELECT json_agg(json_build_object(
                      'id', p.id, 'nro', p.nro_pedido, 'cliente', cl.razon_social,
                      'direccion', d.direccion || COALESCE(', ' || d.localidad, ''),
                      'estado', p.estado, 'motivo', p.motivo_no_entrega,
                      'monto', p.monto_a_cobrar::float8)
                    ORDER BY COALESCE(p.orden_en_ruta, 999), p.id)
               FROM pedidos p
               JOIN clientes cl ON cl.id = p.cliente_id
               JOIN direcciones_cliente d ON d.id = p.direccion_id
              WHERE p.ruta_id = r.id), '[]'::json) AS pedidos
      FROM rutas r JOIN choferes ch ON ch.id = r.chofer_id
     WHERE r.fecha = ${fecha}::date
     ORDER BY r.id`;
  return ok({ rutas });
});

export const POST = conRol(LOGISTICA, async (req, _ctx, s) => {
  const b = await req.json();
  if (!b.fecha || !b.chofer_id || !b.patente) return fail('Completá fecha, chofer y vehículo');
  const [dup] = await sql`
    SELECT 1 FROM rutas WHERE fecha = ${b.fecha}::date AND chofer_id = ${Number(b.chofer_id)} AND estado <> 'cancelada'`;
  if (dup) return fail('Ese chofer ya tiene una ruta para esa fecha', 409);
  await sql`
    INSERT INTO rutas (fecha, chofer_id, patente, creada_por)
    VALUES (${b.fecha}::date, ${Number(b.chofer_id)}, ${b.patente}, ${s.uid})`;
  return ok();
});
