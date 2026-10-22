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
    // Recibimos los datos que envía TabCombustible.jsx
    const { patente, litros, km_momento } = body;

    // Insertamos asignando 'litros' a la columna 'litros_consumidos' 
    // y 'km_momento' a 'km_actual' según tu estructura de Neon
    const result = await sql`
      INSERT INTO combustible (patente, km_anterior, km_actual, litros_consumidos, fecha)
      VALUES (
        ${patente}, 
        0, 
        ${km_momento || 0}, 
        ${litros || 0}, 
        CURRENT_DATE
      )
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}