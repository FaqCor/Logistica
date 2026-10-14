import { sql } from '@/lib/db';
import { conRol, ok, fail, LOGISTICA } from '@/lib/api';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export const POST = conRol(LOGISTICA, async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get('archivo');
    
    if (!file) return fail('No se adjuntó ningún archivo');

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rows || rows.length === 0) {
      return fail('El archivo Excel está vacío o no tiene el formato esperado');
    }

    let importados = 0;

    for (const row of rows) {
      const cliente = row['Cliente'] || row['cliente'] || row['Referencia del pedido'] || '';
      const producto = row['Líneas del pedido/Producto'] || row['producto'] || '';
      const cantidad = row['Líneas del pedido/Cantidad'] || row['cantidad'] || 0;
      const precioUnitario = row['Líneas del pedido/Precio unitario'] || row['precio'] || 0;

      if (cliente) {
        await sql`
          INSERT INTO pedidos (cliente, producto, cantidad, precio_unitario, estado)
          VALUES (${String(cliente)}, ${String(producto)}, ${Number(cantidad)}, ${Number(precioUnitario)}, 'Pendiente')
        `;
        importados++;
      }
    }

    return ok({ mensaje: `Se importaron ${importados} registros correctamente` });
  } catch (error) {
    console.error('Error al importar Excel:', error);
    return fail('Error al procesar el archivo Excel: ' + error.message);
  }
});