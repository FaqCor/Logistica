import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { conRol, ok, fail, num, LOGISTICA } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const GET = conRol(LOGISTICA, async () => {
  const choferes = await sql`
    SELECT id, nombre || ' ' || apellido AS nombre FROM choferes WHERE activo = true ORDER BY apellido, nombre
  `;

  const vehiculos = await sql`
    SELECT patente, marca, modelo, km_actual FROM vehiculos WHERE activo = true ORDER BY patente
  `;

  const clientes = await sql`
    SELECT c.id, c.razon_social,
      COALESCE((SELECT json_agg(json_build_object('id', d.id,
                'label', COALESCE(d.alias || ' - ', '') || d.direccion || COALESCE(', ' || d.localidad, ''))
                ORDER BY d.principal DESC, d.id)) 
      FROM direcciones_cliente d WHERE d.cliente_id = c.id), '[]'::json) AS direcciones 
    FROM clientes c 
    ORDER BY c.razon_social
  `;

  return ok({ choferes, vehiculos, clientes });
});
// tipo: vehiculo | chofer | cliente | direccion
export const POST = conRol(LOGISTICA, async (req) => {
  const { tipo, datos: d } = await req.json();
  const txt = (v) => String(v ?? '').trim() || null;

  if (tipo === 'vehiculo') {
    const patente = String(d.patente || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!patente) return fail('Ingresá la patente');
    await sql`
      INSERT INTO vehiculos (patente, marca, modelo, anio, tipo, capacidad_kg, km_actual)
      VALUES (${patente}, ${txt(d.marca)}, ${txt(d.modelo)}, ${num(d.anio)}, ${txt(d.tipo)}, ${num(d.capacidad_kg)}, ${num(d.km_actual) ?? 0})`;
    return ok();
  }

  if (tipo === 'chofer') {
    const email = String(d.email || '').trim().toLowerCase();
    if (!email || !d.password || !txt(d.nombre) || !txt(d.apellido) || !txt(d.telefono_wsp))
      return fail('Completá email, contraseña, nombre, apellido y WhatsApp');
    if (String(d.password).length < 8) return fail('La contraseña debe tener al menos 8 caracteres');
    const hash = await bcrypt.hash(String(d.password), 10);
    const [u] = await sql`INSERT INTO usuarios (email, password_hash, rol) VALUES (${email}, ${hash}, 'chofer') RETURNING id`;
    try {
      await sql`
        INSERT INTO choferes (usuario_id, nombre, apellido, dni, telefono_wsp, licencia_nro, licencia_vto)
        VALUES (${u.id}, ${txt(d.nombre)}, ${txt(d.apellido)}, ${txt(d.dni)}, ${String(d.telefono_wsp).replace(/\D/g, '')},
                ${txt(d.licencia_nro)}, ${txt(d.licencia_vto)}::date)`;
    } catch (e) {
      await sql`DELETE FROM usuarios WHERE id = ${u.id}`; // no dejar un usuario huérfano
      throw e;
    }
    return ok();
  }

  if (tipo === 'cliente') {
    if (!txt(d.razon_social) || !txt(d.direccion)) return fail('Completá razón social y dirección');
    const [c] = await sql`
      INSERT INTO clientes (razon_social, cuit, telefono, email)
      VALUES (${txt(d.razon_social)}, ${txt(d.cuit)}, ${txt(d.telefono)}, ${txt(d.email)}) RETURNING id`;
    await sql`
      INSERT INTO direcciones_cliente (cliente_id, direccion, localidad, provincia, contacto, principal)
      VALUES (${c.id}, ${txt(d.direccion)}, ${txt(d.localidad)}, ${txt(d.provincia)}, ${txt(d.contacto)}, true)`;
    return ok();
  }

  if (tipo === 'direccion') {
    if (!d.cliente_id || !txt(d.direccion)) return fail('Elegí el cliente e ingresá la dirección');
    await sql`
      INSERT INTO direcciones_cliente (cliente_id, alias, direccion, localidad, provincia, contacto)
      VALUES (${Number(d.cliente_id)}, ${txt(d.alias)}, ${txt(d.direccion)}, ${txt(d.localidad)}, ${txt(d.provincia)}, ${txt(d.contacto)})`;
    return ok();
  }

  return fail('Tipo inválido');
});
