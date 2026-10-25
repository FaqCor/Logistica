import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1. Método POST: Para guardar el checklist en Neon cuando el chofer lo envía
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patente_vehiculo,
      tipo_registro,
      cabina_limpia,
      luces_tablero,
      cinturones,
      limpiaparabrisas,
      espejos,
      bocina,
      aire_acondicionado,
      calefaccion,
      carroceria,
      luces_altas,
      luces_bajas,
      luces_posicion,
      luces_giro_delant,
      luces_freno,
      luces_reversa,
      luces_giro_tras,
      neumaticos_delant,
      neumaticos_tras,
      cierre_puertas,
      cierre_baul,
      cierre_compuertas,
      observaciones
    } = body;

    const query = `
      INSERT INTO checklists (
        patente_vehiculo, tipo_registro,
        cabina_limpia, luces_tablero, cinturones, limpiaparabrisas, espejos, bocina, aire_acondicionado, calefaccion,
        carroceria, luces_altas, luces_bajas, luces_posicion, luces_giro_delant, luces_freno, luces_reversa, luces_giro_tras,
        neumaticos_delant, neumaticos_tras, cierre_puertas, cierre_baul, cierre_compuertas, observaciones, fecha_creacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW()
      ) RETURNING *;
    `;

    const values = [
      patente_vehiculo || '',
      tipo_registro || 'SALIDA',
      cabina_limpia || 'OK',
      luces_tablero || 'OK',
      cinturones || 'OK',
      limpiaparabrisas || 'OK',
      espejos || 'OK',
      bocina || 'OK',
      aire_acondicionado || 'OK',
      calefaccion || 'OK',
      carroceria || 'OK',
      luces_altas || 'OK',
      luces_bajas || 'OK',
      luces_posicion || 'OK',
      luces_giro_delant || 'OK',
      luces_freno || 'OK',
      luces_reversa || 'OK',
      luces_giro_tras || 'OK',
      neumaticos_delant || 'OK',
      neumaticos_tras || 'OK',
      cierre_puertas || 'OK',
      cierre_baul || 'OK',
      cierre_compuertas || 'OK',
      observaciones || ''
    ];

    const result = await pool.query(query, values);

    return NextResponse.json({ 
      success: true, 
      message: 'Checklist guardado exitosamente en la tabla checklists',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al guardar el checklist en Neon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. Método GET: Para verificar si el chofer ya completó el checklist hoy
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patente = searchParams.get('patente');
    const tipo_registro = searchParams.get('tipo_registro') || 'SALIDA';

    if (!patente) {
      return NextResponse.json({ success: false, message: 'Falta la patente' }, { status: 400 });
    }

    const query = `
      SELECT id FROM checklists 
      WHERE patente_vehiculo = $1 
        AND tipo_registro = $2 
        AND DATE(fecha_creacion) = CURRENT_DATE 
      ORDER BY id DESC 
      LIMIT 1;
    `;
    const params = [patente, tipo_registro];

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      completado: result.rows.length > 0
    });
  } catch (error) {
    console.error('Error al verificar el checklist en Neon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}