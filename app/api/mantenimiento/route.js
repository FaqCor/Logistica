import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const mantenimientos = await sql`SELECT * FROM mantenimientos ORDER BY id DESC`;
    return NextResponse.json(mantenimientos, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patente, tipo_mantenimiento, descripcion_trabajo, costo, km_o_horas_actual, proximo_mantenimiento, fecha } = body;

    const result = await sql`
      INSERT INTO mantenimientos (patente, tipo_mantenimiento, descripcion_trabajo, costo, km_o_horas_actual, proximo_mantenimiento, fecha)
      VALUES (
        ${patente}, 
        ${tipo_mantenimiento || 'Preventivo'}, 
        ${descripcion_trabajo || ''}, 
        ${parseFloat(costo) || 0}, 
        ${parseFloat(km_o_horas_actual) || 0}, 
        ${parseFloat(proximo_mantenimiento) || 0}, 
        ${fecha || new Date().toLocaleDateString()}
      )
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
      SET tipo_mantenimiento = ${tipo_mantenimiento}, 
          descripcion_trabajo = ${descripcion_trabajo}, 
          costo = ${parseFloat(costo) || 0}
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

    if (!id) {
      return NextResponse.json({ success: false, error: "ID no proporcionado" }, { status: 400 });
    }

    await sql`DELETE FROM mantenimientos WHERE id = ${id}`;

    return NextResponse.json({ success: true, message: "Eliminado correctamente" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}