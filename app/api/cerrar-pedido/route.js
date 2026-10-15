import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(request) {
  try {
    const { 
      pedidoId, 
      estadoEntrega, 
      efectivo, 
      transferencia, 
      cheque,
      gastos: { desayuno, almuerzo, merienda, cena, hotel, otros },
      kmRecorridos
    } = await request.json();
    
    const ef = parseFloat(efectivo) || 0;
    const tr = parseFloat(transferencia) || 0;
    const ch = parseFloat(cheque) || 0;
    const totalCobrado = ef + tr + ch;

    const gDesayuno = parseFloat(desayuno) || 0;
    const gAlmuerzo = parseFloat(almuerzo) || 0;
    const gMerienda = parseFloat(merienda) || 0;
    const gCena = parseFloat(cena) || 0;
    const gHotel = parseFloat(hotel) || 0;
    const gOtros = parseFloat(otros) || 0;
    const totalGastos = gDesayuno + gAlmuerzo + gMerienda + gCena + gHotel + gOtros;

    const client = await pool.connect();
    await client.query(
      `UPDATE pedidos 
       SET estado_entrega = $1, 
           monto_efectivo = $2, 
           monto_transferencia = $3, 
           monto_cheque = $4, 
           monto_total_cobrado = $5,
           gasto_desayuno = $6,
           gasto_almuerzo = $7,
           gasto_merienda = $8,
           gasto_cena = $9,
           gasto_hotel = $10,
           gasto_otros = $11,
           gasto_total = $12,
           km_recorridos_pedido = $13,
           fecha_cierre = NOW() 
       WHERE id = $14`,
      [
        estadoEntrega, ef, tr, ch, totalCobrado,
        gDesayuno, gAlmuerzo, gMerienda, gCena, gHotel, gOtros, totalGastos,
        parseFloat(kmRecorridos) || 0,
        pedidoId
      ]
    );
    client.release();

    return NextResponse.json({ success: true, message: 'Cierre registrado y viáticos guardados.' });
  } catch (error) {
    console.error('Error al cerrar pedido:', error);
    return NextResponse.json({ error: 'Error al registrar el cierre del pedido' }, { status: 500 });
  }
}