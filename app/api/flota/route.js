import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET: Obtener todos los vehículos o buscar uno específico por patente (para autocompletado en Mantenimiento)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patente = searchParams.get('patente');

    if (patente) {
      const { rows } = await sql`SELECT * FROM vehiculos WHERE patente = ${patente.toUpperCase()}`;
      return NextResponse.json(rows[0] || null);
    }

    const { rows } = await sql`SELECT * FROM vehiculos ORDER BY patente ASC`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Guardar/Actualizar desde Logística o Registrar Fin de Viaje / KM Actual desde el Chofer
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patente,
      modelo,
      tipo_vehiculo,
      km_actual,
      frecuencia_mto,
      km_ultimo_service,
      tipo_mantenimiento,
      mantenimiento_a_realizar,
      novedades_chofer,
      es_cierre_chofer
    } = body;

    const patenteUpper = patente.toUpperCase();

    // Si la petición viene del lado del Chofer al finalizar la ruta en Pedernera 1217
    if (es_cierre_chofer) {
      const vehiculoActual = await sql`SELECT km_actual FROM vehiculos WHERE patente = ${patenteUpper}`;
      const kmAnterior = vehiculoActual.rows[0]?.km_actual || 0;

      const result = await sql`
        UPDATE vehiculos 
        SET km_anterior = ${kmAnterior},
            km_actual = ${km_actual},
            novedades_chofer = ${novedades_chofer || 'Sin novedades'},
            actualizado_at = CURRENT_TIMESTAMP
        WHERE patente = ${patenteUpper}
        RETURNING *;
      `;
      return NextResponse.json({ success: true, data: result.rows[0] });
    }

    // Si la petición viene de Logística (Botón Guardar / Actualizar con clasificación Furgón/Camión y Mantenimiento a Realizar)
    const result = await sql`
      INSERT INTO vehiculos (
        patente, modelo, tipo_vehiculo, km_actual, frecuencia_mto, 
        km_ultimo_service, tipo_mantenimiento, mantenimiento_a_realizar, actualizado_at
      )
      VALUES (
        ${patenteUpper}, ${modelo}, ${tipo_vehiculo}, ${km_actual}, ${frecuencia_mto}, 
        ${km_ultimo_service}, ${tipo_mantenimiento}, ${mantenimiento_a_realizar}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (patente) 
      DO UPDATE SET 
        modelo = EXCLUDED.modelo,
        tipo_vehiculo = EXCLUDED.tipo_vehiculo,
        km_anterior = vehiculos.km_actual,
        km_actual = EXCLUDED.km_actual,
        frecuencia_mto = EXCLUDED.frecuencia_mto,
        km_ultimo_service = EXCLUDED.km_ultimo_service,
        tipo_mantenimiento = EXCLUDED.tipo_mantenimiento,
        mantenimiento_a_realizar = EXCLUDED.mantenimiento_a_realizar,
        actualizado_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}