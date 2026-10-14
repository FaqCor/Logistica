'use client';
import { useState } from 'react';
import { api, money } from '@/components/api';
import { Aviso, Seg } from '@/components/ui';

const MEDIOS = [['efectivo', 'Efectivo'], ['transferencia', 'Transferencia'], ['cheque', 'Cheques'], ['otro', 'Otros']];
const REF = { transferencia: 'Nº de operación', cheque: 'Nº de cheque y banco', otro: 'Detalle' };

function Pago({ n, pago, onChange, onQuitar }) {
  return (
    <div className="item-chk stack">
      <div className="row between">
        <strong>{n === 1 ? 'Forma de pago' : 'Segunda forma de pago'}</strong>
        {onQuitar && <button type="button" className="btn btn-ghost sm" onClick={onQuitar}>Quitar</button>}
      </div>
      <Seg className="wrap" value={pago.medio} onChange={(medio) => onChange({ medio })} options={MEDIOS} />
      <label className="field">
        <span>Monto cobrado</span>
        <input type="number" inputMode="decimal" min="0" step="any" value={pago.monto} onChange={(e) => onChange({ monto: e.target.value })} />
      </label>
      {REF[pago.medio] && (
        <label className="field">
          <span>{REF[pago.medio]} (opcional)</span>
          <input value={pago.referencia} onChange={(e) => onChange({ referencia: e.target.value })} />
        </label>
      )}
    </div>
  );
}

export default function PedidoSheet({ pedido, onCerrar, onGuardado }) {
  const [estado, setEstado] = useState(pedido.estado);
  const [motivo, setMotivo] = useState(pedido.motivo_no_entrega || '');
  const [cobro, setCobro] = useState(null); // true | false | null
  const [pagos, setPagos] = useState([{ medio: '', monto: pedido.monto > 0 ? String(pedido.monto) : '', referencia: '' }]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const setPago = (i, parche) => setPagos((l) => l.map((p, j) => (j === i ? { ...p, ...parche } : p)));
  const total = pagos.reduce((a, p) => a + (Number(p.monto) || 0), 0);

  function agregarSegundo() {
    const resto = Math.max(pedido.monto - (Number(pagos[0].monto) || 0), 0);
    setPagos((l) => [...l, { medio: '', monto: resto > 0 ? String(resto) : '', referencia: '' }]);
  }

  async function guardar() {
    setError('');
    if (estado === 'no_entregado' && !motivo.trim()) return setError('Escribí el motivo por el que no se entregó');
    if (estado === 'entregado') {
      if (cobro === null) return setError('Indicá si cobraste');
      if (cobro && pagos.some((p) => !p.medio || !(Number(p.monto) > 0))) return setError('Elegí el medio y cargá el monto de cada pago');
    }
    setEnviando(true);
    try {
      await api(`/api/chofer/pedidos/${pedido.id}`, {
        method: 'POST',
        body: { estado, motivo, cobro: estado === 'entregado' ? { realizado: cobro, pagos: cobro ? pagos : [] } : undefined },
      });
      onGuardado();
    } catch (e) {
      setError(e.message);
      setEnviando(false);
    }
  }

  return (
    <div className="velo" onClick={onCerrar}>
      <div className="hoja stack" role="dialog" aria-modal="true" aria-label={`Pedido ${pedido.nro_pedido}`} onClick={(e) => e.stopPropagation()}>
        <div className="row between">
          <div>
            <h2>{pedido.nro_pedido}</h2>
            <div className="muted">{pedido.cliente}</div>
          </div>
          <button className="btn btn-ghost sm" onClick={onCerrar}>Cerrar</button>
        </div>

        <Seg
          className={estado === 'no_entregado' ? 'mal' : ''}
          value={estado}
          onChange={setEstado}
          options={[['entregado', 'Entregado'], ['pendiente', 'Pendiente'], ['no_entregado', 'No entregado']]}
        />

        {estado === 'no_entregado' && (
          <label className="field">
            <span>Motivo de la no entrega (obligatorio)</span>
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: local cerrado, rechazó la mercadería…" />
          </label>
        )}

        {estado === 'entregado' && (
          <>
            <div>
              <div className="field"><span>¿Cobró? (a cobrar: {money(pedido.monto)})</span></div>
              <Seg value={cobro === null ? '' : cobro ? 'si' : 'no'} onChange={(v) => setCobro(v === 'si')} options={[['si', 'Sí'], ['no', 'No']]} />
            </div>

            {cobro === true && (
              <>
                {pagos.map((p, i) => (
                  <Pago key={i} n={i + 1} pago={p} onChange={(parche) => setPago(i, parche)} onQuitar={i === 1 ? () => setPagos((l) => l.slice(0, 1)) : undefined} />
                ))}
                {pagos.length < 2 && (
                  <button type="button" className="btn block" onClick={agregarSegundo}>+ Agregar segunda forma de pago</button>
                )}
                <div className="row between num">
                  <span>Total cobrado</span>
                  <strong>{money(total)}</strong>
                </div>
                {pedido.monto > 0 && Math.abs(total - pedido.monto) > 0.5 && (
                  <Aviso tipo="info" msg={`Difiere del monto a cobrar (${money(pedido.monto)}). Podés guardarlo igual.`} />
                )}
              </>
            )}
          </>
        )}

        <Aviso msg={error} />
        <button className="btn btn-primary block" disabled={enviando} onClick={guardar}>{enviando ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </div>
  );
}
