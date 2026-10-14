import { sql } from '@/lib/db';
import { conRol, ok, fail } from '@/lib/api';
import { contextoChofer } from '@/lib/chofer';

const TIPOS = ['hotel', 'comida', 'peaje', 'combustible', 'estacionamiento', 'otro'];

export const POST = conRol(['chofer'], async (req, _ctx, s) => {
  const { chofer, ruta } = await contextoChofer(s.uid);
  if (!ruta) return fail('No tenés una ruta asignada para hoy', 404);
  const b = await req.json();
  const monto = Number(b.monto);
  if (!TIPOS.includes(b.tipo)) return fail('Elegí el tipo de viático');
  if (!(monto > 0)) return fail('Ingresá un monto mayor a cero');
  // El viático queda asociado a la patente de la ruta
  await sql`
    INSERT INTO viaticos (ruta_id, chofer_id, patente, tipo, monto, descripcion)
    VALUES (${ruta.id}, ${chofer.id}, ${ruta.patente}, ${b.tipo}, ${monto}, ${String(b.descripcion || '').trim() || null})`;
  return ok();
});
