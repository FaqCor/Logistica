import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pedidoId, estadoEntrega, efectivo, transferencia, cheque, gastos, kmRecorridos } = body;

    // Forzar que el ID sea un número entero para evitar problemas de tipos en PostgreSQL
    const idPedidoNum = parseInt(pedidoId, 10);

    if (isNaN(idPedidoNum)) {
      return NextResponse.json({ success: false, error: 'El ID del pedido es inválido o no es numérico.' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // 1. Actualizar el estado del pedido principal
    await sql`
      UPDATE pedidos 
      SET 
        estado_entrega = ${estadoEntrega || 'Entregado'},
        monto_total_cobrado = ${parseFloat(efectivo || 0) + parseFloat(transferencia || 0) + parseFloat(cheque || 0)},
        gasto_total = ${
          (parseFloat(gastos?.desayuno) || 0) + 
          (parseFloat(gastos?.almuerzo) || 0) + 
          (parseFloat(gastos?.merienda) || 0) + 
          (parseFloat(gastos?.cena) || 0) + 
          (parseFloat(gastos?.hotel) || 0) + 
          (parseFloat(gastos?.otros) || 0)
        },
        km_recorridos_pedido = ${parseFloat(kmRecorridos || 0)},
        fecha_cierre = CURRENT_TIMESTAMP
      WHERE id = ${idPedidoNum}
    `;

    // 2. Registrar en la tabla normalizada 'registros_entrega'
    await sql`
      INSERT INTO registros_entrega (pedido_id, estado, km_recorrido, fecha_registro)
      VALUES (${idPedidoNum}, ${estadoEntrega || 'Entregado'}, ${parseFloat(kmRecorridos || 0)}, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING;
    `;

    // 3. Registrar desglose de cobranzas en 'cobros' (si hubo montos)
    const totalEfectivo = parseFloat(efectivo) || 0;
    const totalTransferencia = parseFloat(transferencia) || 0;
    const totalCheque = parseFloat(cheque) || 0;

    if (totalEfectivo > 0 || totalTransferencia > 0 || totalCheque > 0) {
      await sql`
        INSERT INTO cobros (pedido_id, monto_efectivo, monto_transferencia, monto_cheque, fecha_cobro)
        VALUES (${idPedidoNum}, ${totalEfectivo}, ${totalTransferencia}, ${totalCheque}, CURRENT_TIMESTAMP)
      `;
    }

    // 4. Registrar viáticos detallados en la tabla 'viaticos'
    const desayuno = parseFloat(gastos?.desayuno) || 0;
    const almuerzo = parseFloat(gastos?.almuerzo) || 0;
    const merienda = parseFloat(gastos?.merienda) || 0;
    const cena = parseFloat(gastos?.cena) || 0;
    const hotel = parseFloat(gastos?.hotel) || 0;
    const otros = parseFloat(gastos?.otros) || 0;
    const sumaViaticos = desayuno + almuerzo + merienda + cena + hotel + otros;

    if (sumaViaticos > 0) {
      await sql`
        INSERT INTO viaticos (pedido_id, desayuno, almuerzo, merienda, cena, hotel, otros, total_viaticos, fecha)
        VALUES (${idPedidoNum}, ${desayuno}, ${almuerzo}, ${merienda}, ${cena}, ${hotel}, ${otros}, ${sumaViaticos}, CURRENT_TIMESTAMP)
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cierre del pedido #${idPedidoNum} registrado con éxito en las tablas correspondientes.` 
    });

  } catch (error) {
    console.error('Error al registrar cierre en Neon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}