import { sql } from '@/lib/db';
import { conRol, ok, LOGISTICA } from '@/lib/api';

// Se llama al tocar "Enviar por WhatsApp" (queda registrada la hora del toque)
export const POST = conRol(LOGISTICA, async (_req, { params }) => {
  await sql`UPDATE rutas SET enviada_wsp_en = now() WHERE id = ${Number(params.id)}`;
  return ok();
});
