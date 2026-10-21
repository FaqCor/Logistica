import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Obtenemos el personal exclusivamente de la tabla unificada 'personal'
    const personalBase = await sql`
      SELECT id, dni, nombre, email, rol, telefono 
      FROM personal 
      ORDER BY nombre ASC
    `;

    // Obtenemos los carnets y vencimientos guardados
    const carnetsGuardados = await sql`
      SELECT * FROM chofer_carnets 
      ORDER BY id DESC
    `;

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

    // Actualizamos o insertamos los vencimientos en chofer_carnets
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