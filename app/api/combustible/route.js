import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const registros = await sql`SELECT * FROM combustible ORDER BY id DESC`;
    return NextResponse.json({ success: true, combustible: registros }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patente, km_anterior, km_actual, litros_consumidos } = body;

    const result = await sql`
      INSERT INTO combustible (patente, km_anterior, km_actual, litros_consumidos, fecha)
      VALUES (${patente}, ${km_anterior}, ${km_actual}, ${litros_consumidos}, TO_CHAR(NOW(), 'DD/MM/YYYY'))
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result[0], message: 'Guardado en Neon exitosamente' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}