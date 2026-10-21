import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Leemos todo el personal (Choferes y Ayudantes) guardado en Neon
    let personalBase = [];
    try {
      personalBase = await sql`SELECT id, nombre, email, rol, telefono FROM personal ORDER BY nombre ASC`;
    } catch (e) {
      // Fallback por si la tabla se llama choferes
      personalBase = await sql`SELECT id, nombre, email, 'Chofer' as rol, telefono FROM choferes ORDER BY nombre ASC`;
    }

    // Leemos los vencimientos de carnets guardados en Neon
    const carnetsGuardados = await sql`SELECT * FROM chofer_carnets ORDER BY id DESC`;

    return NextResponse.json({ success: true, personalBase, carnetsGuardados }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, vencimiento_licencia, vencimiento_cargas_peligrosas, vencimiento_cargas_generales, vencimiento_psicofisico } = body;

    if (!nombre) {
      return NextResponse.json({ success: false, error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Insertamos o actualizamos los vencimientos por el nombre/email del chofer
    const result = await sql`
      INSERT INTO chofer_carnets (nombre, email, vencimiento_licencia, vencimiento_cargas_peligrosas, vencimiento_cargas_generales, vencimiento_psicofisico)
      VALUES (${nombre}, ${email || ''}, ${vencimiento_licencia || ''}, ${vencimiento_cargas_peligrosas || ''}, ${vencimiento_cargas_generales || ''}, ${vencimiento_psicofisico || ''})
      ON CONFLICT (nombre) 
      DO UPDATE SET 
        email = EXCLUDED.email,
        vencimiento_licencia = EXCLUDED.vencimiento_licencia,
        vencimiento_cargas_peligrosas = EXCLUDED.vencimiento_cargas_peligrosas,
        vencimiento_cargas_generales = EXCLUDED.vencimiento_cargas_generales,
        vencimiento_psicofisico = EXCLUDED.vencimiento_psicofisico,
        fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result[0], message: 'Carnets guardados correctamente en Neon' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}