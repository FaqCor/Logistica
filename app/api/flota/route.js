import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET: Obtener todos los vehículos desde Neon
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM flota ORDER BY id DESC');
    client.release();
    return NextResponse.json({ success: true, flota: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Guardar un nuevo vehículo de forma permanente en Neon
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Si viene para actualizar solo el km (desde Actualizar KM)
    if (body.patente && body.km_actual !== undefined) {
      const client = await pool.connect();
      const query = `UPDATE flota SET km = $1 WHERE dominio = $2 RETURNING *;`;
      const result = await client.query(query, [body.km_actual, body.patente]);
      client.release();
      return NextResponse.json({ success: true, vehiculo: result.rows[0] });
    }

    // Si viene para registrar un vehículo nuevo
    const { dominio, modelo, tipo_medicion, km } = body;
    const client = await pool.connect();
    
    const query = `
      INSERT INTO flota (dominio, modelo, tipo_medicion, km, estado, en_mantenimiento)
      VALUES ($1, $2, $3, $4, 'Disponible', false)
      RETURNING *;
    `;
    const values = [dominio?.toUpperCase(), modelo, tipo_medicion || 'Kilómetros', km || 0];
    const result = await client.query(query, values);
    client.release();

    return NextResponse.json({ success: true, vehiculo: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Borrar un vehículo de la base de datos de Neon
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID no proporcionado' }, { status: 400 });
    }

    const client = await pool.connect();
    await client.query('DELETE FROM flota WHERE id = $1', [id]);
    client.release();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}