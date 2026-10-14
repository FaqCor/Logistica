'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, hoyLocal, money } from '@/components/api';
import { Aviso, Badge } from '@/components/ui';
import FormSimple from '@/components/FormSimple';

export default function TabPedidos({ maestros }) {
  const [fecha, setFecha] = useState(hoyLocal());
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try { setPedidos((await api(`/api/logistica/pedidos?fecha=${fecha}`)).pedidos); setError(''); }
    catch (e) { setError(e.message); }
  }, [fecha]);
  useEffect(() => { cargar(); }, [cargar]);

  const direccionesDe = (v) => {
    const c = maestros.clientes.find((x) => String(x.id) === String(v.cliente_id));
    return c ? c.direcciones.map((d) => [d.id, d.label]) : [];
  };

  return (
    <>
      <div className="row between">
        <h2>Pedidos</h2>
        <label className="row"><span className="small">Fecha</span><input type="date" style={{ width: 'auto' }} value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>
      </div>

      <details className="card">
        <summary>Nuevo pedido para el {fecha.split('-').reverse().join('/')}</summary>
        <div style={{ marginTop: 10 }}>
          <FormSimple
            boton="Crear pedido"
            campos={[
              { k: 'cliente_id', label: 'Cliente', req: true, options: maestros.clientes.map((c) => [c.id, c.razon_social]), reset: ['direccion_id'] },
              { k: 'direccion_id', label: 'Dirección de entrega', req: true, options: direccionesDe },
              { k: 'nro_pedido', label: 'Nº de pedido (opcional)' },
              { k: 'descripcion', label: 'Descripción' },
              { k: 'bultos', label: 'Bultos', type: 'number' },
              { k: 'monto_a_cobrar', label: 'Monto a cobrar', type: 'number', def: '0' },
            ]}
            onSubmit={async (v) => { await api('/api/logistica/pedidos', { method: 'POST', body: { ...v, fecha_programada: fecha } }); await cargar(); }}
          />
        </div>
      </details>

      <Aviso msg={error} />
      <div className="card scroll-x">
        <table className="tabla">
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Dirección</th><th className="der">A cobrar</th><th>Estado</th><th>Ruta</th></tr></thead>
          <tbody>
            {pedidos.length === 0 && <tr><td colSpan="6" className="muted">No hay pedidos para esta fecha.</td></tr>}
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.nro_pedido}</td><td>{p.cliente}</td><td>{p.direccion}</td>
                <td className="der num">{money(p.monto)}</td>
                <td><Badge estado={p.estado} /></td>
                <td>{p.ruta_id ? `#${p.ruta_id}` : <span className="badge warn">Sin asignar</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
