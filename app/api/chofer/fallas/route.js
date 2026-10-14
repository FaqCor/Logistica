import { sql } from '@/lib/db';
import { conRol, ok, fail } from '@/lib/api';
import { contextoChofer } from '@/lib/chofer';

const SEVERIDADES = ['baja', 'media', 'alta', 'critica'];

export const POST = conRol(['chofer'], async (req, _ctx, s) => {
  const { chofer, ruta } = await contextoChofer(s.uid);
  if (!ruta) return fail('No tenés una ruta asignada para hoy', 404);
  const b = await req.json();
  const descripcion = String(b.descripcion || '').trim();
  if (!descripcion) return fail('Describí la falla');
  const severidad = SEVERIDADES.includes(b.severidad) ? b.severidad : 'media';
  const lat = Number.isFinite(Number(b.latitud)) && b.latitud !== null ? Number(b.latitud) : null;
  const lng = Number.isFinite(Number(b.longitud)) && b.longitud !== null ? Number(b.longitud) : null;
  await sql`
    INSERT INTO fallas (ruta_id, chofer_id, patente, descripcion, severidad, latitud, longitud)
    VALUES (${ruta.id}, ${chofer.id}, ${ruta.patente}, ${descripcion}, ${severidad}, ${lat}, ${lng})`;
  return ok();
});
