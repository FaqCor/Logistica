import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const combustible = await sql`SELECT * FROM combustible ORDER BY id DESC`;
    return NextResponse.json({ success: true, combustible }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patente, litros, costo, estacion, remito, km_momento } = body;

    const result = await sql`
      INSERT INTO combustible (patente, litros, costo, estacion, remito, km_momento, fecha)
      VALUES (${patente}, ${litros || 0}, ${costo || 0}, ${estacion || 'YPF'}, ${remito || ''}, ${km_momento || 0}, TO_CHAR(NOW(), 'DD/MM/YYYY'))
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, litros, costo, estacion, remito } = body;

    const result = await sql`
      UPDATE combustible
      SET litros = ${litros}, costo = ${costo}, estacion = ${estacion}, remito = ${remito}
      WHERE id = ${id}
      RETURNING *;
    `;
    return NextResponse.json({ success: true, data: result[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await sql`DELETE FROM combustible WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: 'Registro de combustible eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}