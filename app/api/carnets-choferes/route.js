import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Obtenemos los choferes registrados en el sistema y los carnets guardados
    const choferesBase = await sql`SELECT dni, nombre FROM choferes UNION SELECT dni, nombre FROM personal`;
    const carnetsGuardados = await sql`SELECT * FROM chofer_carnets`;

    return NextResponse.json({ success: true, choferesBase, carnetsGuardados }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { dni, nombre, vencimiento_licencia, vencimiento_cargas_peligrosas, vencimiento_cargas_generales, vencimiento_psicofisico } = body;

    const result = await sql`
      INSERT INTO chofer_carnets (dni, nombre, vencimiento_licencia, vencimiento_cargas_peligrosas, vencimiento_cargas_generales, vencimiento_psicofisico)
      VALUES (${dni}, ${nombre}, ${vencimiento_licencia}, ${vencimiento_cargas_peligrosas}, ${vencimiento_cargas_generales}, ${vencimiento_psicofisico})
      ON CONFLICT (dni) 
      DO UPDATE SET 
        nombre = EXCLUDED.nombre,
        vencimiento_licencia = EXCLUDED.vencimiento_licencia,
        vencimiento_cargas_peligrosas = EXCLUDED.vencimiento_cargas_peligrosas,
        vencimiento_cargas_generales = EXCLUDED.vencimiento_cargas_generales,
        vencimiento_psicofisico = EXCLUDED.vencimiento_psicofisico,
        fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result[0], message: 'Carnets actualizados en Neon' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}