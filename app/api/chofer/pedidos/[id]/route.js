import { sql } from '@/lib/db';
import { conRol, ok, fail, MEDIOS } from '@/lib/api';
import { contextoChofer } from '@/lib/chofer';

const ESTADOS = ['entregado', 'pendiente', 'no_entregado'];

export const POST = conRol(['chofer'], async (req, { params }, s) => {
  const { chofer, ruta } = await contextoChofer(s.uid);
  if (!ruta) return fail('No tenés una ruta asignada para hoy', 404);

  const id = Number(params.id);
  const b = await req.json();

  const [p] = await sql`SELECT id FROM pedidos WHERE id = ${id} AND ruta_id = ${ruta.id}`;
  if (!p) return fail('Ese pedido no está en tu ruta', 404);

  const estado = b.estado;
  if (!ESTADOS.includes(estado)) return fail('Estado inválido');

  const motivo = String(b.motivo || '').trim();
  if (estado === 'no_entregado' && !motivo) return fail('Indicá el motivo por el que no se entregó');

  // Cobro: solo se pregunta cuando el pedido se entrega
  let cobroRealizado = false;
  let pagos = [];
  if (estado === 'entregado') {
    if (typeof b.cobro?.realizado !== 'boolean') return fail('Indicá si cobraste o no');
    cobroRealizado = b.cobro.realizado;
    if (cobroRealizado) {
      const lista = (Array.isArray(b.cobro.pagos) ? b.cobro.pagos : []).slice(0, 2); // 1 o 2 formas de pago
      if (lista.length < 1) return fail('Cargá al menos una forma de pago');
      pagos = lista.map((x, i) => ({
        orden: i + 1,
        medio: x.medio,
        monto: Number(x.monto),
        ref: String(x.referencia || '').trim() || null,
      }));
      if (pagos.some((x) => !MEDIOS.includes(x.medio) || !(x.monto > 0)))
        return fail('Revisá el medio y el monto de cada pago');
    }
  }

  const motivoDb = estado === 'no_entregado' ? motivo : null;
  const consultas = [
    sql`UPDATE pedidos
           SET estado = ${estado}, motivo_no_entrega = ${motivoDb},
               entregado_en = ${estado === 'entregado' ? new Date().toISOString() : null}
         WHERE id = ${id}`,
    sql`INSERT INTO pedido_eventos (pedido_id, estado, detalle, usuario_id)
        VALUES (${id}, ${estado}, ${motivoDb}, ${s.uid})`,
    sql`DELETE FROM cobros WHERE pedido_id = ${id}`,
  ];
  if (estado === 'entregado') {
    consultas.push(sql`
      WITH c AS (
        INSERT INTO cobros (pedido_id, cliente_id, chofer_id, patente, cobro_realizado, total_cobrado)
        SELECT p.id, p.cliente_id, ${chofer.id}::bigint, ${ruta.patente}::text, ${cobroRealizado}::boolean, 0
          FROM pedidos p WHERE p.id = ${id}
        RETURNING id)
      INSERT INTO cobro_pagos (cobro_id, orden, medio, monto, referencia)
      SELECT c.id, x.orden, x.medio::medio_pago, x.monto, x.ref
        FROM c, jsonb_to_recordset(${JSON.stringify(pagos)}::jsonb)
             AS x(orden int, medio text, monto numeric, ref text)`);
  }
  await sql.transaction(consultas);
  return ok();
});
