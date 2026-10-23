import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const envios = await sql`SELECT * FROM envios ORDER BY id DESC`;
    return NextResponse.json({ success: true, envios }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { chofer_nombre, vehiculo, pedidosSeleccionados } = body;

    const resultados = [];
    for (const pedido of pedidosSeleccionados) {
      const res = await sql`
        INSERT INTO envios (
          fecha, 
          chofer_nombre, 
          vehiculo, 
          n_pedido, 
          cliente, 
          direccion, 
          provincia, 
          bultos, 
          monto_a_cobrar, 
          estado
        )
        VALUES (
          ${new Date().toLocaleDateString()},
          ${chofer_nombre},
          ${vehiculo},
          ${pedido.n_pedido},
          ${pedido.cliente || '-'},
          ${pedido.direccion || '-'},
          ${pedido.provincia || 'N/A'},
          ${pedido.bultos || 0},
          ${parseFloat(pedido.monto_a_cobrar) || 0},
          'Asignado'
        )
        RETURNING *;
      `;
      resultados.push(res[0]);
    }

    return NextResponse.json({ success: true, data: resultados }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}