import { sql } from '@/lib/db';
import { conRol, ok, fail } from '@/lib/api';
import { contextoChofer } from '@/lib/chofer';

export const POST = conRol(['chofer'], async (req, _ctx, s) => {
  const { chofer, ruta } = await contextoChofer(s.uid);
  if (!ruta) return fail('No tenés una ruta asignada para hoy', 404);
  const texto = String((await req.json()).texto || '').trim();
  if (!texto) return fail('Escribí la observación');
  await sql`
    INSERT INTO observaciones (ruta_id, chofer_id, patente, texto)
    VALUES (${ruta.id}, ${chofer.id}, ${ruta.patente}, ${texto})`;
  return ok();
});
