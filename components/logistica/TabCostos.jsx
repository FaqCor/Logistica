'use client';
import { useEffect, useMemo, useState } from 'react';
import { api, fechaCorta, money } from '@/components/api';
import { Aviso } from '@/components/ui';

export default function TabCostos() {
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const [datos, setDatos] = useState({ filas: [], cobros: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/logistica/costos?mes=${mes}`).then((d) => { setDatos(d); setError(''); }).catch((e) => setError(e.message));
  }, [mes]);

  const porPatente = useMemo(() => {
    const m = new Map();
    for (const f of datos.filas) {
      if (!m.has(f.patente)) m.set(f.patente, { patente: f.patente, total: 0, filas: [] });
      const g = m.get(f.patente);
      g.total += f.monto;
      g.filas.push(f);
    }
    return [...m.values()];
  }, [datos]);
  const cobrado = Object.fromEntries(datos.cobros.map((c) => [c.patente, c.cobrado]));
  const totalGeneral = porPatente.reduce((a, g) => a + g.total, 0);
  const sheet = process.env.NEXT_PUBLIC_SHEET_URL;

  return (
    <>
      <div className="row between">
        <h2>Costos por patente</h2>
        <div className="row">
          <label className="row"><span className="small">Mes</span><input type="month" style={{ width: 'auto' }} value={mes} onChange={(e) => setMes(e.target.value)} /></label>
          {sheet && <a className="btn" href={sheet} target="_blank" rel="noreferrer">Abrir en Google Sheets</a>}
        </div>
      </div>
      <Aviso msg={error} />
      <div className="card row between"><span>Costo total del mes</span><strong className="num" style={{ fontSize: '1.4rem' }}>{money(totalGeneral)}</strong></div>

      {porPatente.length === 0 && <div className="card muted">No hay costos cargados en este mes.</div>}
      {porPatente.map((g) => (
        <details key={g.patente} className="card">
          <summary>
            <span className="row between" style={{ width: '100%' }}>
              <strong>{g.patente}</strong>
              <span className="num">Costos {money(g.total)}{cobrado[g.patente] != null && ` | Cobrado ${money(cobrado[g.patente])}`}</span>
            </span>
          </summary>
          <div className="scroll-x">
            <table className="tabla">
              <thead><tr><th>Fecha</th><th>Concepto</th><th>Detalle</th><th className="der">Monto</th></tr></thead>
              <tbody>
                {g.filas.map((f, i) => (
                  <tr key={i}><td>{fechaCorta(f.fecha)}</td><td>{f.concepto}</td><td className="muted">{f.detalle}</td><td className="der num">{money(f.monto)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </>
  );
}
