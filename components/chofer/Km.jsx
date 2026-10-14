'use client';
import { useState } from 'react';
import { api } from '@/components/api';
import { Aviso } from '@/components/ui';

export default function Km({ ruta, onCambio }) {
  const [km, setKm] = useState(ruta.km_fin ?? '');
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  const [ocupado, setOcupado] = useState(false);

  async function guardar(cerrar) {
    if (cerrar && !confirm('¿Finalizar la jornada? Después no vas a poder modificar los pedidos.')) return;
    setOcupado(true);
    try {
      await api('/api/chofer/km', { method: 'POST', body: { km: Number(km), cerrar } });
      setMsg({ tipo: 'ok', texto: cerrar ? 'Jornada finalizada.' : 'Km guardado.' });
      onCambio();
    } catch (e) {
      setMsg({ tipo: 'bad', texto: e.message });
    }
    setOcupado(false);
  }

  const cerrada = ruta.estado === 'finalizada';

  return (
    <div className="card stack">
      <h2>Kilometraje</h2>
      <div className="row between"><span className="muted">Km de salida</span><strong className="num">{ruta.km_inicio ?? '-'}</strong></div>
      {cerrada && <Aviso tipo="info" msg="La jornada ya fue finalizada." />}
      <label className="field">
        <span>Km actual del vehículo</span>
        <input type="number" inputMode="numeric" min={ruta.km_inicio ?? 0} value={km} onChange={(e) => setKm(e.target.value)} disabled={cerrada} />
      </label>
      <Aviso tipo={msg.tipo} msg={msg.texto} />
      <button className="btn block" disabled={ocupado || cerrada || km === ''} onClick={() => guardar(false)}>Guardar km</button>
      <button className="btn btn-primary block" disabled={ocupado || cerrada || km === ''} onClick={() => guardar(true)}>Guardar y finalizar jornada</button>
    </div>
  );
}
