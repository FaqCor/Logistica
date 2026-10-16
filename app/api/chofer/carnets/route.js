import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM choferes_carnets ORDER BY nombre_chofer ASC');
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
      nombre_chofer,
      dni,
      telefono,
      vencimiento_carnet_conducir,
      vencimiento_cargas_peligrosas,
      vencimiento_cargas_generales,
      vencimiento_psicofisico
    } = body;

    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO choferes_carnets (
          nombre_chofer, dni, telefono, vencimiento_carnet_conducir, 
          vencimiento_cargas_peligrosas, vencimiento_cargas_generales, vencimiento_psicofisico, actualizado_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (dni) 
        DO UPDATE SET 
          nombre_chofer = EXCLUDED.nombre_chofer,
          telefono = EXCLUDED.telefono,
          vencimiento_carnet_conducir = EXCLUDED.vencimiento_carnet_conducir,
          vencimiento_cargas_peligrosas = EXCLUDED.vencimiento_cargas_peligrosas,
          vencimiento_cargas_generales = EXCLUDED.vencimiento_cargas_generales,
          vencimiento_psicofisico = EXCLUDED.vencimiento_psicofisico,
          actualizado_at = CURRENT_TIMESTAMP
        RETURNING *;
      `, [
        nombre_chofer, dni, telefono, vencimiento_carnet_conducir, 
        vencimiento_cargas_peligrosas, vencimiento_cargas_generales, vencimiento_psicofisico
      ]);

      return NextResponse.json({ success: true, data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}