import { sql } from '@/lib/db';
import { conRol, ok, fail } from '@/lib/api';
import { contextoChofer } from '@/lib/chofer';

export const POST = conRol(['chofer'], async (req, _ctx, s) => {
  const { ruta } = await contextoChofer(s.uid);
  if (!ruta) return fail('No tenés una ruta asignada para hoy', 404);
  const b = await req.json();
  const km = parseInt(b.km, 10);
  if (!Number.isInteger(km) || km < 0) return fail('Ingresá un km válido');
  if (ruta.km_inicio != null && km < ruta.km_inicio)
    return fail(`El km no puede ser menor al de salida (${ruta.km_inicio})`);
  const estado = b.cerrar ? 'finalizada' : ruta.estado;
  // El trigger de la base actualiza vehiculos.km_actual
  await sql`UPDATE rutas SET km_fin = ${km}, estado = ${estado} WHERE id = ${ruta.id}`;
  return ok();
});
