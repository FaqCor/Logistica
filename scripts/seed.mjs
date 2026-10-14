// Datos de demostración. Uso: npm run db:seed
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);
const hoy = new Date().toLocaleDateString('en-CA', { timeZone: process.env.TZ_APP || 'America/Argentina/Buenos_Aires' });
const clave = await bcrypt.hash('demo1234', 10);

await sql`INSERT INTO usuarios (email, password_hash, rol) VALUES ('logistica@demo.com', ${clave}, 'logistica') ON CONFLICT (email) DO NOTHING`;
await sql`INSERT INTO usuarios (email, password_hash, rol) VALUES ('chofer@demo.com', ${clave}, 'chofer') ON CONFLICT (email) DO NOTHING`;
const [uc] = await sql`SELECT id FROM usuarios WHERE email = 'chofer@demo.com'`;

await sql`INSERT INTO choferes (usuario_id, nombre, apellido, dni, telefono_wsp)
          VALUES (${uc.id}, 'Juan', 'Pérez', '30111222', '5491100000000') ON CONFLICT (usuario_id) DO NOTHING`;
await sql`INSERT INTO vehiculos (patente, marca, modelo, anio, tipo, km_actual)
          VALUES ('AB123CD', 'Mercedes-Benz', 'Sprinter', 2021, 'Utilitario', 84500) ON CONFLICT (patente) DO NOTHING`;

const [{ n }] = await sql`SELECT count(*)::int AS n FROM checklist_items`;
if (n === 0) {
  const items = ['Luces (altas, bajas, giro, freno)', 'Neumáticos y rueda de auxilio', 'Frenos', 'Nivel de aceite y agua',
    'Combustible suficiente', 'Documentación del vehículo y seguro', 'Carga asegurada y limpieza de la caja', 'Matafuego y balizas'];
  for (let i = 0; i < items.length; i++)
    await sql`INSERT INTO checklist_items (descripcion, orden) VALUES (${items[i]}, ${i + 1})`;
}

await sql`INSERT INTO clientes (razon_social, cuit) VALUES ('Ferretería Central SA', '30-70000001-1') ON CONFLICT (cuit) DO NOTHING`;
await sql`INSERT INTO clientes (razon_social, cuit) VALUES ('Distribuidora Norte SRL', '30-70000002-2') ON CONFLICT (cuit) DO NOTHING`;
for (const [cuit, dir, loc] of [['30-70000001-1', 'Av. Rivadavia 5000', 'CABA'], ['30-70000002-2', 'Av. Maipú 1500', 'Vicente López']]) {
  const [c] = await sql`SELECT id FROM clientes WHERE cuit = ${cuit}`;
  const [{ tiene }] = await sql`SELECT count(*)::int AS tiene FROM direcciones_cliente WHERE cliente_id = ${c.id}`;
  if (!tiene)
    await sql`INSERT INTO direcciones_cliente (cliente_id, direccion, localidad, provincia, principal)
              VALUES (${c.id}, ${dir}, ${loc}, 'Buenos Aires', true)`;
}

const [{ hay }] = await sql`SELECT count(*)::int AS hay FROM pedidos WHERE nro_pedido LIKE 'DEMO-%'`;
if (!hay) {
  const dirs = await sql`SELECT d.id, d.cliente_id FROM direcciones_cliente d ORDER BY d.id LIMIT 2`;
  for (let i = 0; i < dirs.length; i++)
    await sql`INSERT INTO pedidos (nro_pedido, cliente_id, direccion_id, descripcion, bultos, monto_a_cobrar, fecha_programada)
              VALUES (${'DEMO-' + (i + 1)}, ${dirs[i].cliente_id}, ${dirs[i].id}, 'Mercadería general', ${3 + i}, ${50000 * (i + 1)}, ${hoy}::date)`;
}

console.log('Listo. Usuarios de prueba (clave: demo1234):\n  logistica@demo.com\n  chofer@demo.com\nCambiá estas claves antes de usar la app en producción.');
