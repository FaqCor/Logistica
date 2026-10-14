'use client';
import { useState } from 'react';
import { money } from '@/components/api';
import { Badge } from '@/components/ui';
import PedidoSheet from './PedidoSheet';

export default function Pedidos({ data, onCambio }) {
  const { pedidos, ruta } = data;
  const [abierto, setAbierto] = useState(null);

  const entregados = pedidos.filter((p) => p.estado === 'entregado').length;
  const cobrado = pedidos.reduce((a, p) => a + p.total_cobrado, 0);
  const pct = pedidos.length ? Math.round((entregados / pedidos.length) * 100) : 0;

  return (
    <>
      <div className="card stack">
        <div className="row between">
          <h2>{entregados} de {pedidos.length} entregados</h2>
          <span className="num"><strong>{money(cobrado)}</strong> cobrado</span>
        </div>
        <div className="progreso" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
        {ruta.url_mapa && (
          <a className="btn btn-senal block" href={ruta.url_mapa} target="_blank" rel="noreferrer">Abrir recorrido en Google Maps</a>
        )}
      </div>

      {pedidos.length === 0 && <div className="card muted">Todavía no tenés pedidos asignados en esta ruta.</div>}

      {pedidos.map((p, i) => (
        <div key={p.id} className="card pedido stack">
          <div className="cab">
            <span className="nro">{i + 1}. {p.nro_pedido}</span>
            <Badge estado={p.estado} />
          </div>
          <div className="cliente">{p.cliente}</div>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.direccion)}`} target="_blank" rel="noreferrer">{p.direccion}</a>
          {(p.descripcion || p.bultos || p.horario_ent || p.contacto) && (
            <div className="muted small">
              {[p.descripcion, p.bultos ? `${p.bultos} bultos` : null, p.horario_ent ? `Horario: ${p.horario_ent}` : null, p.contacto ? `Contacto: ${p.contacto}` : null].filter(Boolean).join(' | ')}
            </div>
          )}
          {p.estado === 'no_entregado' && <div className="aviso bad small">Motivo: {p.motivo_no_entrega}</div>}
          <div className="row between">
            <span className="num">A cobrar: <strong>{money(p.monto)}</strong>{p.estado === 'entregado' && p.cobro_realizado === false && <span className="badge warn" style={{ marginLeft: 8 }}>No cobrado</span>}</span>
            {ruta.estado !== 'finalizada' && (
              <button className="btn btn-primary sm" onClick={() => setAbierto(p)}>{p.estado === 'pendiente' ? 'Registrar' : 'Modificar'}</button>
            )}
          </div>
        </div>
      ))}

      {abierto && (
        <PedidoSheet
          pedido={abierto}
          onCerrar={() => setAbierto(null)}
          onGuardado={() => { setAbierto(null); onCambio(); }}
        />
      )}
    </>
  );
}
