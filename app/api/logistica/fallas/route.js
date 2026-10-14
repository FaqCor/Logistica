import { sql } from '@/lib/db';
import { conRol, ok, fail, LOGISTICA } from '@/lib/api';

export const dynamic = 'force-dynamic';

// Las abiertas primero, luego las últimas resueltas
export const GET = conRol(LOGISTICA, async () => {
  const fallas = await sql`
    SELECT f.id, f.patente, f.descripcion, f.severidad::text AS severidad, f.estado::text AS estado,
           f.latitud::float8 AS latitud, f.longitud::float8 AS longitud, f.creado_en,
           ch.nombre || ' ' || ch.apellido AS chofer, ch.telefono_wsp
      FROM fallas f JOIN choferes ch ON ch.id = f.chofer_id
     ORDER BY (f.estado = 'resuelta'), f.creado_en DESC
     LIMIT 60`;
  return ok({ fallas });
});

export const PATCH = conRol(LOGISTICA, async (req) => {
  const { id, estado } = await req.json();
  if (!['abierta', 'en_revision', 'resuelta'].includes(estado)) return fail('Estado inválido');
  await sql`
    UPDATE fallas SET estado = ${estado},
           resuelto_en = ${estado === 'resuelta' ? new Date().toISOString() : null}
     WHERE id = ${Number(id)}`;
  return ok();
});
