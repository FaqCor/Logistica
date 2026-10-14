import { sql, hoyAR } from '@/lib/db';
import { conRol, ok, fail, num, LOGISTICA } from '@/lib/api';

export const dynamic = 'force-dynamic';

// ?fecha=YYYY-MM-DD  (&sinRuta=1 para ver solo los no asignados)
export const GET = conRol(LOGISTICA, async (req) => {
  const q = new URL(req.url).searchParams;
  const fecha = q.get('fecha') || hoyAR();
  const sinRuta = q.get('sinRuta') === '1';
  const pedidos = await sql`
    SELECT p.id, p.nro_pedido, p.descripcion, p.estado::text AS estado, p.ruta_id,
           p.monto_a_cobrar::float8 AS monto, cl.razon_social AS cliente,
           d.direccion || COALESCE(', ' || d.localidad, '') AS direccion
      FROM pedidos p
      JOIN clientes cl ON cl.id = p.cliente_id
      JOIN direcciones_cliente d ON d.id = p.direccion_id
     WHERE p.fecha_programada = ${fecha}::date
       AND (${sinRuta}::boolean = false OR p.ruta_id IS NULL)
     ORDER BY p.id DESC`;
  return ok({ pedidos });
});

export const POST = conRol(LOGISTICA, async (req) => {
  const b = await req.json();
  if (!b.cliente_id || !b.direccion_id || !b.fecha_programada)
    return fail('Elegí cliente, dirección y fecha');
  const nro = String(b.nro_pedido || '').trim() || 'P-' + Date.now().toString(36).toUpperCase();
  await sql`
    INSERT INTO pedidos (nro_pedido, cliente_id, direccion_id, descripcion, bultos, peso_kg, monto_a_cobrar, fecha_programada)
    VALUES (${nro}, ${Number(b.cliente_id)}, ${Number(b.direccion_id)}, ${String(b.descripcion || '').trim() || null},
            ${num(b.bultos)}, ${num(b.peso_kg)}, ${num(b.monto_a_cobrar) ?? 0}, ${b.fecha_programada}::date)`;
  return ok();
});
