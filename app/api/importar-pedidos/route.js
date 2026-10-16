import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(request) {
  try {
    const { pedidos } = await request.json();

    if (!pedidos || !Array.isArray(pedidos) || pedidos.length === 0) {
      return NextResponse.json({ error: 'No hay pedidos para importar' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Construimos una consulta masiva dinámica para insertar todos de un solo golpe
      const queryValues = [];
      const placeholders = [];
      let index = 1;

      for (const p of pedidos) {
        placeholders.push(`($${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, 'Sin asignar')`);
        queryValues.push(
          p.Cliente || p.cliente || '',
          p.Direccion || p.dirección || p.Dirección || '',
          p.Localidad || p.localidad || 'Salta',
          String(p.Telefono || p.teléfono || p.Teléfono || ''),
          p.Detalle || p.detalle || p.Pedido || '',
          Number(p.Monto || p.monto || 0)
        );
      }

      const bulkQuery = `
        INSERT INTO pedidos (cliente, direccion, localidad, telefono, detalle, monto, estado) 
        VALUES ${placeholders.join(', ')}
      `;

      await client.query(bulkQuery, queryValues);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, message: `Se importaron ${pedidos.length} pedidos con éxito.` });
  } catch (error) {
    console.error('Error al importar:', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar la importación.' }, { status: 500 });
  }
}