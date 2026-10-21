import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    let personalBase = [];
    try {
      personalBase = await sql`SELECT id, dni, nombre, email, rol, telefono FROM personal ORDER BY nombre ASC`;
    } catch (e) {
      personalBase = await sql`SELECT id, '' as dni, nombre, email, 'Chofer' as rol, telefono FROM choferes ORDER BY nombre ASC`;
    }

    const carnetsGuardados = await sql`SELECT * FROM chofer_carnets ORDER BY id DESC`;

    return NextResponse.json({ success: true, personalBase, carnetsGuardados }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { dni, nombre, vencimiento_licencia, vencimiento_cargas_peligrosas, vencimiento_cargas_generales, vencimiento_psicofisico } = body;

    if (!nombre) {
      return NextResponse.json({ success: false, error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Intentamos actualizar primero el registro existente en Neon
    const updateResult = await sql`
      UPDATE chofer_carnets 
      SET dni = ${dni || ''},
          vencimiento_licencia = ${vencimiento_licencia || ''},
          vencimiento_cargas_peligrosas = ${vencimiento_cargas_peligrosas || ''},
          vencimiento_cargas_generales = ${vencimiento_cargas_generales || ''},
          vencimiento_psicofisico = ${vencimiento_psicofisico || ''},
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE nombre = ${nombre}
      RETURNING *;
    `;

    let result;
    if (updateResult.length > 0) {
      result = updateResult[0];
    } else {
      // Si no existe, lo insertamos como nuevo
      const insertResult = await sql`
        INSERT INTO chofer_carnets (dni, nombre, vencimiento_licencia, vencimiento_cargas_peligrosas, vencimiento_cargas_generales, vencimiento_psicofisico)
        VALUES (${dni || ''}, ${nombre}, ${vencimiento_licencia || ''}, ${vencimiento_cargas_peligrosas || ''}, ${vencimiento_cargas_generales || ''}, ${vencimiento_psicofisico || ''})
        RETURNING *;
      `;
      result = insertResult[0];
    }

    return NextResponse.json({ success: true, data: result, message: 'Guardado correctamente en Neon' }, { status: 201 });
  } catch (error) {
    console.error("Error al guardar carnets:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}