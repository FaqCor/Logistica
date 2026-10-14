'use client';
import { api } from '@/components/api';
import { Patente } from '@/components/ui';

const SEV = { baja: ['Baja', ''], media: ['Media', 'warn'], alta: ['Alta', 'bad'], critica: ['Crítica', 'bad'] };

export default function TabFallas({ fallas, recargar }) {
  const cambiar = async (id, estado) => { await api('/api/logistica/fallas', { method: 'PATCH', body: { id, estado } }); recargar(); };
  const abiertas = fallas.filter((f) => f.estado !== 'resuelta');
  const resueltas = fallas.filter((f) => f.estado === 'resuelta');

  const Fila = ({ f }) => (
    <div className={`card stack ${f.estado === 'resuelta' ? 'cerrada' : 'alerta'}`}>
      <div className="row between">
        <div className="row"><Patente chica>{f.patente}</Patente><strong>{f.chofer}</strong></div>
        <div className="row">
          <span className={`badge ${SEV[f.severidad]?.[1]}`}>{SEV[f.severidad]?.[0]}</span>
          <span className="muted small">{new Date(f.creado_en).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
      </div>
      <div>{f.descripcion}</div>
      <div className="row">
        {f.estado === 'abierta' && <button className="btn btn-senal sm" onClick={() => cambiar(f.id, 'en_revision')}>Tomar</button>}
        {f.estado !== 'resuelta' && <button className="btn btn-primary sm" onClick={() => cambiar(f.id, 'resuelta')}>Marcar resuelta</button>}
        {f.estado === 'resuelta' && <button className="btn btn-ghost sm" onClick={() => cambiar(f.id, 'abierta')}>Reabrir</button>}
        {f.telefono_wsp && <a className="btn btn-ghost sm" href={`https://wa.me/${f.telefono_wsp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">Escribirle por WhatsApp</a>}
        {f.latitud != null && <a className="btn btn-ghost sm" href={`https://www.google.com/maps?q=${f.latitud},${f.longitud}`} target="_blank" rel="noreferrer">Ver ubicación</a>}
        {f.estado === 'en_revision' && <span className="badge info">En revisión</span>}
      </div>
    </div>
  );

  return (
    <>
      <h2>Fallas reportadas</h2>
      <p className="muted small" style={{ margin: 0 }}>Se actualiza solo cada 15 segundos.</p>
      {abiertas.length === 0 && <div className="card muted">No hay fallas abiertas.</div>}
      {abiertas.map((f) => <Fila key={f.id} f={f} />)}
      {resueltas.length > 0 && (
        <details>
          <summary>Resueltas recientes ({resueltas.length})</summary>
          <div className="stack">{resueltas.map((f) => <Fila key={f.id} f={f} />)}</div>
        </details>
      )}
    </>
  );
}
