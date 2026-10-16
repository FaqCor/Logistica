import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patente = searchParams.get('patente');

    const client = await pool.connect();
    try {
      if (patente) {
        const { rows } = await client.query('SELECT * FROM vehiculos WHERE patente = $1', [patente.toUpperCase()]);
        return NextResponse.json(rows[0] || null);
      }

      const { rows } = await client.query('SELECT * FROM vehiculos ORDER BY costo_mantenimiento DESC, patente ASC');
      return NextResponse.json(rows);
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
      costo_mantenimiento,
      novedades_chofer,
      es_cierre_chofer
    } = body;

    const patenteUpper = patente.toUpperCase();
    const client = await pool.connect();

    try {
      if (es_cierre_chofer) {
        const vehiculoActual = await client.query('SELECT km_actual FROM vehiculos WHERE patente = $1', [patenteUpper]);
        const kmAnterior = vehiculoActual.rows[0]?.km_actual || 0;

        const result = await client.query(`
          UPDATE vehiculos 
          SET km_anterior = $1,
              km_actual = $2,
              novedades_chofer = $3,
              actualizado_at = CURRENT_TIMESTAMP
          WHERE patente = $4
          RETURNING *;
        `, [kmAnterior, km_actual, novedades_chofer || 'Sin novedades', patenteUpper]);

        return NextResponse.json({ success: true, data: result.rows[0] });
      }

      const result = await client.query(`
        INSERT INTO vehiculos (
          patente, modelo, tipo_vehiculo, km_actual, frecuencia_mto, 
          km_ultimo_service, tipo_mantenimiento, mantenimiento_a_realizar, costo_mantenimiento, actualizado_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
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
          costo_mantenimiento = EXCLUDED.costo_mantenimiento,
          actualizado_at = CURRENT_TIMESTAMP
        RETURNING *;
      `, [
        patenteUpper, modelo, tipo_vehiculo || 'Furgón', km_actual, frecuencia_mto, 
        km_ultimo_service, tipo_mantenimiento, mantenimiento_a_realizar, costo_mantenimiento || 0
      ]);

      return NextResponse.json({ success: true, data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}