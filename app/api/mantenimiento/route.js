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
    const { patente, tipo, descripcion, costo, lectura } = body;

    const result = await sql`
      INSERT INTO mantenimientos (patente, tipo, descripcion, costo, lectura, fecha)
      VALUES (
        ${patente}, 
        ${tipo || 'Preventivo'}, 
        ${descripcion || ''}, 
        ${parseFloat(costo) || 0}, 
        ${parseFloat(lectura) || 0}, 
        NOW()
      )
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}