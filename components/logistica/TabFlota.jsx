'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, fechaCorta, money } from '@/components/api';
import FormSimple from '@/components/FormSimple';
import { Aviso, Patente } from '@/components/ui';

function Mantenimientos({ maestros }) {
  const [lista, setLista] = useState([]);
  const [hecho, setHecho] = useState(null); // id del mantenimiento que se está cerrando
  const [error, setError] = useState('');
  const cargar = useCallback(async () => {
    try { setLista((await api('/api/logistica/mantenimientos')).mantenimientos); } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className="card stack">
      <h2>Mantenimientos</h2>
      <details>
        <summary>Programar mantenimiento</summary>
        <div style={{ marginTop: 10 }}>
          <FormSimple
            boton="Programar"
            campos={[
              { k: 'patente', label: 'Vehículo', req: true, options: maestros.vehiculos.map((v) => [v.patente, v.patente]) },
              { k: 'tipo', label: 'Tipo', req: true, options: [['preventivo', 'Preventivo'], ['correctivo', 'Correctivo']] },
              { k: 'descripcion', label: 'Qué se hace', req: true },
              { k: 'fecha_programada', label: 'Fecha', type: 'date' },
              { k: 'km_programado', label: 'O al llegar a (km)', type: 'number' },
            ]}
            onSubmit={async (v) => { await api('/api/logistica/mantenimientos', { method: 'POST', body: v }); await cargar(); }}
          />
        </div>
      </details>
      <Aviso msg={error} />
      <div className="scroll-x">
        <table className="tabla">
          <thead><tr><th>Patente</th><th>Trabajo</th><th>Cuándo</th><th>Estado</th><th className="der">Costo</th><th></th></tr></thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan="6" className="muted">No hay mantenimientos cargados.</td></tr>}
            {lista.map((m) => (
              <tr key={m.id}>
                <td><Patente chica>{m.patente}</Patente></td>
                <td>{m.descripcion}<div className="muted small">{m.tipo}</div></td>
                <td>{m.estado === 'realizado' ? fechaCorta(m.fecha_realizada) : m.fecha_programada ? fechaCorta(m.fecha_programada) : m.km_programado ? `${m.km_programado} km` : '-'}</td>
                <td><span className={`badge ${m.estado === 'realizado' ? 'ok' : 'warn'}`}>{m.estado === 'realizado' ? 'Realizado' : 'Programado'}</span></td>
                <td className="der num">{m.costo != null ? money(m.costo) : ''}</td>
                <td className="der">{m.estado === 'programado' && <button className="btn btn-ghost sm" onClick={() => setHecho(m.id)}>Marcar realizado</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hecho && (
        <div className="card alerta">
          <h3>Datos del mantenimiento realizado</h3>
          <FormSimple
            boton="Confirmar"
            campos={[
              { k: 'costo', label: 'Costo', type: 'number', req: true },
              { k: 'km_realizado', label: 'Km al realizarlo', type: 'number' },
              { k: 'taller', label: 'Taller' },
            ]}
            onSubmit={async (v) => { await api('/api/logistica/mantenimientos', { method: 'PATCH', body: { ...v, id: hecho } }); setHecho(null); await cargar(); }}
          />
        </div>
      )}
    </div>
  );
}

export default function TabFlota({ maestros, recargar }) {
  const guardar = (tipo) => async (datos) => { await api('/api/logistica/maestros', { method: 'POST', body: { tipo, datos } }); await recargar(); };

  return (
    <>
      <Mantenimientos maestros={maestros} />

      <div className="grilla2">
        <div className="card stack">
          <h3>Flota ({maestros.vehiculos.length})</h3>
          <div className="small muted">{maestros.vehiculos.map((v) => `${v.patente} (${v.km_actual} km)`).join(', ') || 'Sin vehículos'}</div>
          <FormSimple boton="Agregar vehículo" onSubmit={guardar('vehiculo')} campos={[
            { k: 'patente', label: 'Patente', req: true },
            { k: 'marca', label: 'Marca' }, { k: 'modelo', label: 'Modelo' },
            { k: 'anio', label: 'Año', type: 'number' }, { k: 'tipo', label: 'Tipo (camión, utilitario…)' },
            { k: 'capacidad_kg', label: 'Capacidad (kg)', type: 'number' }, { k: 'km_actual', label: 'Km actual', type: 'number' },
          ]} />
        </div>

        <div className="card stack">
          <h3>Choferes ({maestros.choferes.length})</h3>
          <div className="small muted">{maestros.choferes.map((c) => c.nombre).join(', ') || 'Sin choferes'}</div>
          <FormSimple boton="Agregar chofer" onSubmit={guardar('chofer')} campos={[
            { k: 'nombre', label: 'Nombre', req: true }, { k: 'apellido', label: 'Apellido', req: true },
            { k: 'dni', label: 'DNI' }, { k: 'telefono_wsp', label: 'WhatsApp (con código de país, ej. 5491155551234)', req: true },
            { k: 'email', label: 'Email de acceso', type: 'email', req: true },
            { k: 'password', label: 'Contraseña inicial (mín. 8)', type: 'password', req: true },
          ]} />
        </div>

        <div className="card stack">
          <h3>Clientes ({maestros.clientes.length})</h3>
          <FormSimple boton="Agregar cliente" onSubmit={guardar('cliente')} campos={[
            { k: 'razon_social', label: 'Razón social', req: true }, { k: 'cuit', label: 'CUIT' },
            { k: 'telefono', label: 'Teléfono' }, { k: 'contacto', label: 'Contacto en destino' },
            { k: 'direccion', label: 'Dirección', req: true }, { k: 'localidad', label: 'Localidad' }, { k: 'provincia', label: 'Provincia' },
          ]} />
        </div>

        <div className="card stack">
          <h3>Otra dirección para un cliente</h3>
          <FormSimple boton="Agregar dirección" onSubmit={guardar('direccion')} campos={[
            { k: 'cliente_id', label: 'Cliente', req: true, options: maestros.clientes.map((c) => [c.id, c.razon_social]) },
            { k: 'alias', label: 'Nombre (ej. Sucursal Norte)' }, { k: 'direccion', label: 'Dirección', req: true },
            { k: 'localidad', label: 'Localidad' }, { k: 'provincia', label: 'Provincia' }, { k: 'contacto', label: 'Contacto' },
          ]} />
        </div>
      </div>
    </>
  );
}
