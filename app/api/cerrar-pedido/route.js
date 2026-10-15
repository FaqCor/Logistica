import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(request) {
  try {
    const { pedidoId, estadoEntrega, efectivo, transferencia, cheque } = await request.json();
    
    const ef = parseFloat(efectivo) || 0;
    const tr = parseFloat(transferencia) || 0;
    const ch = parseFloat(cheque) || 0;
    const total = ef + tr + ch;

    const client = await pool.connect();
    await client.query(
      `UPDATE pedidos 
       SET estado_entrega = $1, 
           monto_efectivo = $2, 
           monto_transferencia = $3, 
           monto_cheque = $4, 
           monto_total_cobrado = $5, 
           fecha_cierre = NOW() 
       WHERE id = $6`,
      [estadoEntrega, ef, tr, ch, total, pedidoId]
    );
    client.release();

    return NextResponse.json({ success: true, message: 'Pedido cerrado y registrado correctamente.' });
  } catch (error) {
    console.error('Error al cerrar pedido:', error);
    return NextResponse.json({ error: 'Error al registrar el cierre del pedido' }, { status: 500 });
  }
}