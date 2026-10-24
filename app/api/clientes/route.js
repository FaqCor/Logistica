import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de conexión utilizando la variable de entorno de Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();
    // Consulta a la tabla 'clientes' que creamos en Neon
    const result = await client.query('SELECT * FROM clientes ORDER BY id ASC;');
    client.release();

    return NextResponse.json({ 
      success: true, 
      clientes: result.rows 
    });
  } catch (error) {
    console.error('Error al obtener los clientes desde Neon:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}