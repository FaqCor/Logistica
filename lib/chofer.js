import { sql, hoyAR } from './db';

// Chofer logueado y su ruta de hoy (una sola ruta activa por día)
export async function contextoChofer(uid) {
  const [chofer] = await sql`
    SELECT id, nombre, apellido FROM choferes WHERE usuario_id = ${uid} AND activo`;
  if (!chofer) return {};
  const [ruta] = await sql`
    SELECT r.id, r.fecha::text AS fecha, r.patente, r.estado, r.km_inicio, r.km_fin,
           r.url_mapa, v.marca, v.modelo, v.km_actual
      FROM rutas r JOIN vehiculos v ON v.patente = r.patente
     WHERE r.chofer_id = ${chofer.id}
       AND r.fecha = ${hoyAR()}::date
       AND r.estado <> 'cancelada'
     ORDER BY r.id DESC LIMIT 1`;
  return { chofer, ruta };
}
