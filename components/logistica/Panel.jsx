'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, cerrarSesion } from '@/components/api';
import TabRutas from './TabRutas';
import TabPedidos from './TabPedidos';
import TabFallas from './TabFallas';
import TabCostos from './TabCostos';
import TabFlota from './TabFlota';

const TABS = [['rutas', 'Rutas'], ['pedidos', 'Pedidos'], ['fallas', 'Fallas'], ['costos', 'Costos'], ['flota', 'Flota y maestros']];

export default function Panel({ email }) {
  const [tab, setTab] = useState('rutas');
  const [maestros, setMaestros] = useState({ choferes: [], vehiculos: [], clientes: [] });
  const [fallas, setFallas] = useState([]);

  const cargarMaestros = useCallback(async () => {
    try { setMaestros(await api('/api/logistica/maestros')); } catch {}
  }, []);
  const cargarFallas = useCallback(async () => {
    try { setFallas((await api('/api/logistica/fallas')).fallas); } catch {}
  }, []);

  useEffect(() => {
    cargarMaestros();
    cargarFallas();
    const t = setInterval(cargarFallas, 15000); // fallas casi en tiempo real
    return () => clearInterval(t);
  }, [cargarMaestros, cargarFallas]);

  const abiertas = fallas.filter((f) => f.estado === 'abierta').length;

  return (
    <>
      <header className="topbar">
        <h1>Panel de logística</h1>
        <div className="row">
          <span className="small" style={{ opacity: .85 }}>{email}</span>
          <button className="btn btn-ghost sm" onClick={cerrarSesion}>Salir</button>
        </div>
      </header>
      <nav className="tabs" aria-label="Secciones">
        {TABS.map(([k, t]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {t}{k === 'fallas' && abiertas > 0 && <span className="cuenta">{abiertas}</span>}
          </button>
        ))}
      </nav>
      <main className="contenedor ancho stack">
        {tab === 'rutas' && <TabRutas maestros={maestros} />}
        {tab === 'pedidos' && <TabPedidos maestros={maestros} />}
        {tab === 'fallas' && <TabFallas fallas={fallas} recargar={cargarFallas} />}
        {tab === 'costos' && <TabCostos />}
        {tab === 'flota' && <TabFlota maestros={maestros} recargar={cargarMaestros} />}
      </main>
    </>
  );
}
