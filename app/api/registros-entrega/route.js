import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const registros = await sql`SELECT * FROM registros_entrega ORDER BY id DESC`;
    return NextResponse.json(registros, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { fecha, n_pedido, cliente, provincia, estado, efectivo, transferencia, cheques, viaticos, km_recorridos } = body;

    const result = await sql`
      INSERT INTO registros_entrega (fecha, n_pedido, cliente, provincia, estado, efectivo, transferencia, cheques, viaticos, km_recorridos)
      VALUES (
        ${fecha || new Date().toLocaleDateString()},
        ${n_pedido},
        ${cliente || '-'},
        ${provincia || 'N/A'},
        ${estado || 'Pendiente'},
        ${parseFloat(efectivo) || 0},
        ${parseFloat(transferencia) || 0},
        ${parseFloat(cheques) || 0},
        ${parseFloat(viaticos) || 0},
        ${parseFloat(km_recorridos) || 0}
      )
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}