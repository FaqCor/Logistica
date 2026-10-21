import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const mantenimientos = await sql`SELECT * FROM mantenimientos ORDER BY id DESC`;
    return NextResponse.json({ success: true, mantenimientos }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patente, tipo_mantenimiento, descripcion_trabajo, costo, km_o_horas_actual, proximo_mantenimiento } = body;

    const result = await sql`
      INSERT INTO mantenimientos (patente, tipo_mantenimiento, descripcion_trabajo, costo, km_o_horas_actual, proximo_mantenimiento, fecha)
      VALUES (${patente}, ${tipo_mantenimiento}, ${descripcion_trabajo}, ${costo || 0}, ${km_o_horas_actual || 0}, ${proximo_mantenimiento || 0}, TO_CHAR(NOW(), 'DD/MM/YYYY'))
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
    const { id, tipo_mantenimiento, descripcion_trabajo, costo } = body;

    const result = await sql`
      UPDATE mantenimientos
      SET tipo_mantenimiento = ${tipo_mantenimiento}, descripcion_trabajo = ${descripcion_trabajo}, costo = ${costo}
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
    await sql`DELETE FROM mantenimientos WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: 'Registro eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}