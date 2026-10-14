'use client';
import { api, money } from '@/components/api';
import FormSimple from '@/components/FormSimple';

const TIPOS = [['hotel', 'Hotel'], ['comida', 'Comida'], ['peaje', 'Peaje'], ['combustible', 'Combustible'], ['estacionamiento', 'Estacionamiento'], ['otro', 'Otro']];
const NOMBRE = Object.fromEntries(TIPOS);

export default function Viaticos({ data, onCambio }) {
  const { viaticos, ruta } = data;
  const total = viaticos.reduce((a, v) => a + v.monto, 0);

  return (
    <>
      <div className="card stack">
        <h2>Cargar viático</h2>
        <p className="muted small" style={{ margin: 0 }}>Se registra a nombre de la patente {ruta.patente}.</p>
        <FormSimple
          boton="Guardar viático"
          campos={[
            { k: 'tipo', label: 'Tipo', req: true, options: TIPOS },
            { k: 'monto', label: 'Monto', type: 'number', req: true },
            { k: 'descripcion', label: 'Detalle (opcional)' },
          ]}
          onSubmit={async (v) => { await api('/api/chofer/viaticos', { method: 'POST', body: v }); onCambio(); }}
        />
      </div>

      <div className="card stack">
        <div className="row between">
          <h3>Cargados hoy</h3>
          <strong className="num">{money(total)}</strong>
        </div>
        {viaticos.length === 0 && <span className="muted">Todavía no cargaste viáticos.</span>}
        {viaticos.map((v) => (
          <div key={v.id} className="row between">
            <span>{NOMBRE[v.tipo] || v.tipo}{v.descripcion ? ` - ${v.descripcion}` : ''}</span>
            <span className="num">{money(v.monto)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
