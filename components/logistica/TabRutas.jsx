'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, hoyLocal, money } from '@/components/api';
import { Aviso, Badge, Patente } from '@/components/ui';
import FormSimple from '@/components/FormSimple';
import { linkWhatsApp } from '@/lib/wsp';

const ESTADO_RUTA = { planificada: ['Planificada', ''], en_curso: ['En curso', 'info'], finalizada: ['Finalizada', 'ok'], cancelada: ['Cancelada', 'bad'] };

function RutaCard({ ruta, disponibles, onCambio }) {
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [elegido, setElegido] = useState('');

  const [txtEstado, claseEstado] = ESTADO_RUTA[ruta.estado] || [ruta.estado, ''];
  const entregados = ruta.pedidos.filter((p) => p.estado === 'entregado').length;
  const cerrada = ruta.estado === 'finalizada' || ruta.estado === 'cancelada';

  async function accion(fn, ok) {
    setOcupado(true);
    setMsg(null);
    try {
      const r = await fn();
      setMsg({ tipo: 'ok', texto: typeof ok === 'function' ? ok(r) : ok });
      await onCambio();
    } catch (e) {
      setMsg({ tipo: 'bad', texto: e.message });
    }
    setOcupado(false);
  }

  const optimizar = () =>
    accion(
      () => api(`/api/logistica/rutas/${ruta.id}/optimizar`, { method: 'POST' }),
      (r) => r.fuente === 'google'
        ? `Ruta optimizada con Google Maps${r.km ? ` (${Math.round(r.km)} km, ${Math.round(r.minutos)} min)` : ''}.`
        : 'Mapa generado con el orden actual. Configurá el Apps Script para optimizar el orden.'
    );

  const link = linkWhatsApp({
    telefono: ruta.telefono_wsp,
    chofer: ruta.chofer_nombre,
    fecha: ruta.fecha,
    patente: ruta.patente,
    pedidos: ruta.pedidos,
    urlMapa: ruta.url_mapa,
  });

  return (
    <div className={`card stack ${cerrada ? 'cerrada' : ''}`}>
      <div className="row between">
        <div className="row">
          <Patente chica>{ruta.patente}</Patente>
          <h3>{ruta.chofer}</h3>
        </div>
        <div className="row">
          <span className={`badge ${ruta.checklist_ok ? 'ok' : 'warn'}`}>{ruta.checklist_ok ? 'Checklist hecho' : 'Sin checklist'}</span>
          <span className={`badge ${claseEstado}`}>{txtEstado}</span>
        </div>
      </div>

      <div className="muted small num">
        {entregados}/{ruta.pedidos.length} entregados | Cobrado {money(ruta.cobrado)}
        {ruta.km_inicio != null && ` | Km ${ruta.km_inicio}${ruta.km_fin != null ? ` a ${ruta.km_fin}` : ''}`}
        {ruta.enviada_wsp_en && ` | WhatsApp enviado ${new Date(ruta.enviada_wsp_en).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
      </div>

      <div className="scroll-x">
        <table className="tabla">
          <tbody>
            {ruta.pedidos.length === 0 && <tr><td className="muted">Sin pedidos asignados.</td></tr>}
            {ruta.pedidos.map((p, i) => (
              <tr key={p.id}>
                <td className="num">{i + 1}</td>
                <td><strong>{p.cliente}</strong><div className="muted small">{p.direccion} - {p.nro}</div>{p.motivo && <div className="small" style={{ color: 'var(--mal)' }}>Motivo: {p.motivo}</div>}</td>
                <td><Badge estado={p.estado} /></td>
                <td className="der">
                  {p.estado === 'pendiente' && !cerrada && (
                    <button className="btn btn-ghost sm" disabled={ocupado} onClick={() => accion(() => api(`/api/logistica/rutas/${ruta.id}/pedidos`, { method: 'DELETE', body: { pedido_id: p.id } }), 'Pedido quitado.')}>Quitar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!cerrada && (
        <div className="row">
          <select className="grow" value={elegido} onChange={(e) => setElegido(e.target.value)} aria-label="Pedido a agregar">
            <option value="">Agregar pedido sin asignar…</option>
            {disponibles.map((p) => <option key={p.id} value={p.id}>{p.nro_pedido} - {p.cliente} - {p.direccion}</option>)}
          </select>
          <button className="btn" disabled={!elegido || ocupado} onClick={() => { const id = Number(elegido); setElegido(''); accion(() => api(`/api/logistica/rutas/${ruta.id}/pedidos`, { method: 'POST', body: { pedido_ids: [id] } }), 'Pedido agregado. Volvé a optimizar la ruta.'); }}>Agregar</button>
        </div>
      )}

      <Aviso msg={msg?.texto} tipo={msg?.tipo} />

      {!cerrada && (
        <div className="row">
          <button className="btn btn-senal" disabled={ocupado || ruta.pedidos.length === 0} onClick={optimizar}>Optimizar ruta</button>
          {ruta.url_mapa && <a className="btn" href={ruta.url_mapa} target="_blank" rel="noreferrer">Ver mapa</a>}
          <a
            className="btn btn-primary"
            href={link}
            target="_blank"
            rel="noreferrer"
            aria-disabled={ruta.pedidos.length === 0}
            onClick={(e) => {
              if (ruta.pedidos.length === 0) return e.preventDefault();
              api(`/api/logistica/rutas/${ruta.id}/enviado`, { method: 'POST' }).then(onCambio).catch(() => {});
            }}
          >
            Enviar por WhatsApp
          </a>
        </div>
      )}
      {!ruta.url_mapa && !cerrada && ruta.pedidos.length > 0 && (
        <div className="muted small">Optimizá la ruta antes de enviarla para que el mensaje incluya el mapa.</div>
      )}
    </div>
  );
}

export default function TabRutas({ maestros }) {
  const [fecha, setFecha] = useState(hoyLocal());
  const [rutas, setRutas] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      const [r, d] = await Promise.all([
        api(`/api/logistica/rutas?fecha=${fecha}`),
        api(`/api/logistica/pedidos?fecha=${fecha}&sinRuta=1`),
      ]);
      setRutas(r.rutas);
      setDisponibles(d.pedidos);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [fecha]);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 20000);
    return () => clearInterval(t);
  }, [cargar]);

  return (
    <>
      <div className="row between">
        <h2>Rutas del día</h2>
        <label className="row"><span className="small">Fecha</span><input type="date" style={{ width: 'auto' }} value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>
      </div>
      <Aviso msg={error} />

      <details className="card">
        <summary>Nueva ruta</summary>
        <div style={{ marginTop: 10 }}>
          <FormSimple
            boton="Crear ruta"
            campos={[
              { k: 'chofer_id', label: 'Chofer', req: true, options: maestros.choferes.map((c) => [c.id, c.nombre]) },
              { k: 'patente', label: 'Vehículo', req: true, options: maestros.vehiculos.map((v) => [v.patente, `${v.patente} ${v.marca || ''} ${v.modelo || ''}`]) },
            ]}
            onSubmit={async (v) => { await api('/api/logistica/rutas', { method: 'POST', body: { ...v, fecha } }); await cargar(); }}
          />
        </div>
      </details>

      {rutas.length === 0 && <div className="card muted">No hay rutas para esta fecha. Creá una y asignale pedidos.</div>}
      <div className="grilla2">
        {rutas.map((r) => <RutaCard key={r.id} ruta={r} disponibles={disponibles} onCambio={cargar} />)}
      </div>
    </>
  );
}
