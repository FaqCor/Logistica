'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, cerrarSesion, fechaCorta } from '@/components/api';
import { Aviso, Patente } from '@/components/ui';
import Checklist from './Checklist';
import Pedidos from './Pedidos';
import Viaticos from './Viaticos';
import Incidencias from './Incidencias';
import Km from './Km';

const TABS = [
  ['pedidos', 'Pedidos'],
  ['viaticos', 'Viáticos'],
  ['incidencias', 'Incidencias'],
  ['km', 'Km'],
];

export default function ChoferApp() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('pedidos');

  const cargar = useCallback(async () => {
    try {
      setData(await api('/api/chofer/ruta'));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const ruta = data?.ruta;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>{data?.chofer ? `Hola, ${data.chofer.nombre}` : 'Mi ruta'}</h1>
          {ruta && <div className="small" style={{ opacity: .85 }}>{fechaCorta(ruta.fecha)}</div>}
        </div>
        <div className="row">
          {ruta && <Patente>{ruta.patente}</Patente>}
          <button className="btn btn-ghost sm" onClick={cerrarSesion}>Salir</button>
        </div>
      </header>

      <main className="contenedor stack">
        <Aviso msg={error} />
        {!data && !error && <p className="muted">Cargando tu ruta…</p>}

        {data && !data.chofer && (
          <Aviso tipo="info" msg="Tu usuario no tiene un perfil de chofer. Pedile a logística que lo cree." />
        )}
        {data?.chofer && !ruta && (
          <div className="card">
            <h2>Sin ruta para hoy</h2>
            <p className="muted">Logística todavía no te asignó una ruta. Volvé a abrir esta pantalla en unos minutos.</p>
            <button className="btn block" onClick={cargar}>Actualizar</button>
          </div>
        )}

        {ruta && !data.checklist.completo && (
          <Checklist ruta={ruta} items={data.checklist.items} onListo={cargar} />
        )}

        {ruta && data.checklist.completo && (
          <>
            {tab === 'pedidos' && <Pedidos data={data} onCambio={cargar} />}
            {tab === 'viaticos' && <Viaticos data={data} onCambio={cargar} />}
            {tab === 'incidencias' && <Incidencias data={data} onCambio={cargar} />}
            {tab === 'km' && <Km ruta={ruta} onCambio={cargar} />}
          </>
        )}
      </main>

      {ruta && data.checklist.completo && (
        <nav className="navinf" aria-label="Secciones">
          {TABS.map(([k, t]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>
          ))}
        </nav>
      )}
    </>
  );
}
