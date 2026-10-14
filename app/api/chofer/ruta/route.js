import { sql } from '@/lib/db';
import { conRol, ok } from '@/lib/api';
import { contextoChofer } from '@/lib/chofer';

export const dynamic = 'force-dynamic';

export const GET = conRol(['chofer'], async (_req, _ctx, s) => {
  const { chofer, ruta } = await contextoChofer(s.uid);
  if (!chofer) return ok({ chofer: null, ruta: null });
  if (!ruta) return ok({ chofer, ruta: null });

  const [chk] = await sql`SELECT completado FROM checklists WHERE ruta_id = ${ruta.id}`;
  if (!chk?.completado) {
    // Sin checklist completo NO se envían los pedidos al celular
    const items = await sql`
      SELECT id, descripcion, obligatorio FROM checklist_items WHERE activo ORDER BY orden, id`;
    return ok({ chofer, ruta, checklist: { completo: false, items }, pedidos: [] });
  }

  const pedidos = await sql`
    SELECT p.id, p.nro_pedido, p.descripcion, p.bultos, p.monto_a_cobrar::float8 AS monto,
           p.estado, p.motivo_no_entrega, p.orden_en_ruta,
           cl.razon_social AS cliente, cl.telefono,
           d.direccion || COALESCE(', ' || d.localidad, '') AS direccion,
           d.contacto, d.horario_ent,
           c.cobro_realizado, COALESCE(c.total_cobrado, 0)::float8 AS total_cobrado
      FROM pedidos p
      JOIN clientes cl ON cl.id = p.cliente_id
      JOIN direcciones_cliente d ON d.id = p.direccion_id
      LEFT JOIN cobros c ON c.pedido_id = p.id
     WHERE p.ruta_id = ${ruta.id}
     ORDER BY COALESCE(p.orden_en_ruta, 999), p.id`;
  const viaticos = await sql`
    SELECT id, tipo::text AS tipo, monto::float8 AS monto, descripcion
      FROM viaticos WHERE ruta_id = ${ruta.id} ORDER BY id DESC`;
  const observaciones = await sql`
    SELECT id, texto, creado_en FROM observaciones WHERE ruta_id = ${ruta.id} ORDER BY id DESC`;
  const fallas = await sql`
    SELECT id, descripcion, severidad::text AS severidad, estado::text AS estado
      FROM fallas WHERE ruta_id = ${ruta.id} ORDER BY id DESC`;

  return ok({ chofer, ruta, checklist: { completo: true }, pedidos, viaticos, observaciones, fallas });
});
