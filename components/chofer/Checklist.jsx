'use client';
import { useState } from 'react';
import { api } from '@/components/api';
import { Aviso } from '@/components/ui';

export default function Checklist({ ruta, items, onListo }) {
  const [km, setKm] = useState(ruta.km_actual ?? '');
  const [resp, setResp] = useState({}); // { [item_id]: { ok, comentario } }
  const [obs, setObs] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const set = (id, parche) => setResp((r) => ({ ...r, [id]: { ...r[id], ...parche } }));
  const faltan = items.filter((i) => i.obligatorio && typeof resp[i.id]?.ok !== 'boolean').length;
  const fallasSinTexto = items.some((i) => resp[i.id]?.ok === false && !String(resp[i.id]?.comentario || '').trim());
  const listo = faltan === 0 && !fallasSinTexto && km !== '' && Number(km) >= 0;

  async function enviar() {
    setEnviando(true);
    setError('');
    try {
      await api('/api/chofer/checklist', {
        method: 'POST',
        body: {
          km: Number(km),
          observaciones: obs,
          respuestas: items
            .filter((i) => typeof resp[i.id]?.ok === 'boolean')
            .map((i) => ({ item_id: i.id, ok: resp[i.id].ok, comentario: resp[i.id].comentario || '' })),
        },
      });
      onListo();
    } catch (e) {
      setError(e.message);
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="card alerta">
        <h2>Control del vehículo</h2>
        <p className="muted" style={{ margin: '6px 0 0' }}>
          Completalo antes de salir. Hasta que lo envíes no vas a ver los pedidos del día.
        </p>
      </div>

      <label className="field">
        <span>Km actual del vehículo</span>
        <input type="number" inputMode="numeric" min="0" value={km} onChange={(e) => setKm(e.target.value)} />
      </label>

      {items.map((i) => {
        const r = resp[i.id];
        return (
          <div key={i.id} className={`item-chk ${r?.ok === false ? 'falla' : ''}`}>
            <div className="nombre">{i.descripcion}{!i.obligatorio && <span className="muted small"> (opcional)</span>}</div>
            <div className="seg">
              <button type="button" className={r?.ok === true ? 'on' : ''} onClick={() => set(i.id, { ok: true })}>Está bien</button>
              <button type="button" className={r?.ok === false ? 'on' : ''} style={r?.ok === false ? { background: 'var(--mal)' } : undefined} onClick={() => set(i.id, { ok: false })}>Tiene falla</button>
            </div>
            {r?.ok === false && (
              <textarea style={{ marginTop: 8 }} placeholder="¿Qué problema tiene?" value={r.comentario || ''} onChange={(e) => set(i.id, { comentario: e.target.value })} />
            )}
          </div>
        );
      })}

      <label className="field">
        <span>Observaciones (opcional)</span>
        <textarea value={obs} onChange={(e) => setObs(e.target.value)} />
      </label>

      <Aviso msg={error} />
      <button className="btn btn-primary block" disabled={!listo || enviando} onClick={enviar}>
        {enviando ? 'Enviando…' : listo ? 'Enviar y ver mis pedidos' : faltan > 0 ? `Faltan ${faltan} ítems por responder` : 'Completá el km y los motivos de falla'}
      </button>
    </>
  );
}
