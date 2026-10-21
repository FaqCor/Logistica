import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const flota = await sql`SELECT * FROM flota ORDER BY id ASC`;
    return NextResponse.json({ success: true, flota }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patente, modelo, km_actual, km_anterior, estado } = body;

    const result = await sql`
      INSERT INTO flota (patente, modelo, km_actual, km_anterior, estado)
      VALUES (${patente}, ${modelo}, ${km_actual || 0}, ${km_anterior || 0}, ${estado || 'Activo'})
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
    const { id, patente, modelo, km_actual, estado } = body;

    const result = await sql`
      UPDATE flota
      SET modelo = ${modelo}, km_actual = ${km_actual}, estado = ${estado}
      WHERE id = ${id} OR patente = ${patente}
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
    await sql`DELETE FROM flota WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: 'Vehículo eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}