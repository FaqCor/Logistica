'use client';
import { useState } from 'react';
import { api } from '@/components/api';
import FormSimple from '@/components/FormSimple';
import { Aviso } from '@/components/ui';

const SEVERIDAD = [['baja', 'Baja'], ['media', 'Media'], ['alta', 'Alta'], ['critica', 'Crítica - no puedo seguir']];
const ESTADO_FALLA = { abierta: ['Avisada', 'warn'], en_revision: ['En revisión', 'info'], resuelta: ['Resuelta', 'ok'] };

// Intenta tomar la ubicación; si no hay permiso, la falla se envía igual
function ubicacion() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitud: p.coords.latitude, longitud: p.coords.longitude }),
      () => resolve({}),
      { timeout: 4000, maximumAge: 60000 }
    );
  });
}

export default function Incidencias({ data, onCambio }) {
  const { fallas, observaciones } = data;
  const [enviada, setEnviada] = useState('');

  return (
    <>
      <div className="card alerta stack">
        <h2>Reportar falla del vehículo</h2>
        <p className="muted small" style={{ margin: 0 }}>Le llega al instante al panel de logística.</p>
        <Aviso tipo="ok" msg={enviada} />
        <FormSimple
          boton="Avisar a logística"
          campos={[
            { k: 'severidad', label: 'Gravedad', req: true, def: 'media', options: SEVERIDAD },
            { k: 'descripcion', label: '¿Qué pasó?', type: 'textarea', req: true },
          ]}
          onSubmit={async (v) => {
            const pos = await ubicacion();
            await api('/api/chofer/fallas', { method: 'POST', body: { ...v, ...pos } });
            setEnviada('Falla enviada. Logística ya la puede ver.');
            onCambio();
          }}
        />
        {fallas.length > 0 && (
          <div className="stack">
            <h3>Fallas de hoy</h3>
            {fallas.map((f) => (
              <div key={f.id} className="row between">
                <span>{f.descripcion}</span>
                <span className={`badge ${ESTADO_FALLA[f.estado]?.[1]}`}>{ESTADO_FALLA[f.estado]?.[0]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card stack">
        <h2>Observaciones de la ruta</h2>
        <p className="muted small" style={{ margin: 0 }}>Inconvenientes en el camino: pinchadura, demoras, desvíos.</p>
        <FormSimple
          boton="Guardar observación"
          campos={[{ k: 'texto', label: 'Observación', type: 'textarea', req: true }]}
          onSubmit={async (v) => { await api('/api/chofer/observaciones', { method: 'POST', body: v }); onCambio(); }}
        />
        {observaciones.map((o) => (
          <div key={o.id} className="small" style={{ borderTop: '1px solid var(--linea)', paddingTop: 8 }}>
            <span className="muted">{new Date(o.creado_en).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - </span>
            {o.texto}
          </div>
        ))}
      </div>
    </>
  );
}
