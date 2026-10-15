import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request) {
  try {
    const client = await pool.connect();
    // Aseguramos traer columnas clave: numero_pedido o id, bultos, direccion, cliente, etc.
    const result = await client.query('SELECT * FROM pedidos ORDER BY id DESC');
    client.release();
    
    return NextResponse.json({ success: true, pedidos: result.rows });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return NextResponse.json({ error: 'Error al obtener los pedidos' }, { status: 500 });
  }
}