import { sql } from '@/lib/db';
import { conRol, ok, fail } from '@/lib/api';
import { contextoChofer } from '@/lib/chofer';

export const POST = conRol(['chofer'], async (req, _ctx, s) => {
  const { ruta } = await contextoChofer(s.uid);
  if (!ruta) return fail('No tenés una ruta asignada para hoy', 404);

  const body = await req.json();
  const km = parseInt(body.km, 10);
  if (!Number.isInteger(km) || km < 0) return fail('Ingresá el km actual del vehículo');

  const [ya] = await sql`SELECT 1 FROM checklists WHERE ruta_id = ${ruta.id}`;
  if (ya) return fail('El checklist de hoy ya fue completado', 409);

  const items = await sql`SELECT id, obligatorio FROM checklist_items WHERE activo`;
  const recibidas = new Map((Array.isArray(body.respuestas) ? body.respuestas : []).map((r) => [Number(r.item_id), r]));

  const filas = [];
  for (const it of items) {
    const r = recibidas.get(Number(it.id));
    const respondido = r && typeof r.ok === 'boolean';
    if (!respondido) {
      if (it.obligatorio) return fail('Completá todos los ítems del checklist');
      continue;
    }
    const comentario = String(r.comentario || '').trim();
    if (!r.ok && !comentario) return fail('Explicá el problema en los ítems marcados con falla');
    filas.push({ item_id: Number(it.id), ok: r.ok, comentario: comentario || null });
  }

  await sql.transaction([
    sql`WITH c AS (
          INSERT INTO checklists (ruta_id, km_registrado, observaciones, completado, completado_en)
          VALUES (${ruta.id}, ${km}, ${String(body.observaciones || '').trim() || null}, true, now())
          RETURNING id)
        INSERT INTO checklist_respuestas (checklist_id, item_id, ok, comentario)
        SELECT c.id, x.item_id, x.ok, x.comentario
          FROM c, jsonb_to_recordset(${JSON.stringify(filas)}::jsonb)
               AS x(item_id int, ok boolean, comentario text)`,
    sql`UPDATE rutas SET km_inicio = ${km}, estado = 'en_curso' WHERE id = ${ruta.id}`,
    sql`UPDATE vehiculos SET km_actual = GREATEST(km_actual, ${km}) WHERE patente = ${ruta.patente}`,
  ]);
  return ok();
});
