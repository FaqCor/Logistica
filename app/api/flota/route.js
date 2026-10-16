import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const flota = await sql`SELECT * FROM flota_mantenimiento ORDER BY patente ASC`;
    return NextResponse.json({ success: true, flota });
  } catch (error) {
    console.error('Error al obtener la flota:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patente, modelo, kmActual, frecuencia, ultimoKm, tipoMantenimiento } = body;

    const sql = neon(process.env.DATABASE_URL);

    // Verificar si ya existe para guardar el km anterior
    const existente = await sql`SELECT km_actual FROM flota_mantenimiento WHERE patente = ${patente.toUpperCase()}`;
    const kmAnterior = existente.length > 0 ? existente[0].km_actual : (parseInt(ultimoKm) || 0);

    await sql`
      INSERT INTO flota_mantenimiento (patente, modelo, km_anterior, km_actual, frecuencia_mantenimiento, ultimo_mantenimiento_km, tipo_mantenimiento, actualizado_at)
      VALUES (
        ${patente.toUpperCase()}, 
        ${modelo}, 
        ${kmAnterior}, 
        ${parseInt(kmActual) || 0}, 
        ${parseInt(frecuencia) || 15000}, 
        ${parseInt(ultimoKm) || 0}, 
        ${tipoMantenimiento || 'Mantenimiento General'}, 
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (patente) DO UPDATE SET
        modelo = EXCLUDED.modelo,
        km_anterior = flota_mantenimiento.km_actual,
        km_actual = EXCLUDED.km_actual,
        frecuencia_mantenimiento = EXCLUDED.frecuencia_mantenimiento,
        ultimo_mantenimiento_km = EXCLUDED.ultimo_mantenimiento_km,
        tipo_mantenimiento = EXCLUDED.tipo_mantenimiento,
        actualizado_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true, message: `Vehículo ${patente} actualizado correctamente.` });
  } catch (error) {
    console.error('Error al actualizar flota:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}