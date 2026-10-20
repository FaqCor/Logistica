import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM personal ORDER BY id ASC');
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nombre, rol, email, telefono } = await request.json();
    const result = await pool.query(
      'INSERT INTO personal (nombre, rol, email, telefono) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, rol || 'Chofer', email, telefono || '-']
    );
    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await pool.query('DELETE FROM personal WHERE id = $1', [id]);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}