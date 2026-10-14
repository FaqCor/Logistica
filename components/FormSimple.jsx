'use client';
import { useState } from 'react';

// Formulario genérico. campos: [{ k, label, type, req, def, options, reset }]
// options puede ser un array [[valor, texto]] o una función (valores) => array
export default function FormSimple({ campos, onSubmit, boton = 'Guardar' }) {
  const inicial = Object.fromEntries(campos.map((c) => [c.k, c.def ?? '']));
  const [v, setV] = useState(inicial);
  const [err, setErr] = useState('');
  const [ocupado, setOcupado] = useState(false);

  function cambiar(c, valor) {
    const nuevo = { ...v, [c.k]: valor };
    (c.reset || []).forEach((k) => (nuevo[k] = ''));
    setV(nuevo);
  }

  async function enviar(e) {
    e.preventDefault();
    setOcupado(true);
    setErr('');
    try {
      await onSubmit(v);
      setV(inicial);
    } catch (x) {
      setErr(x.message);
    }
    setOcupado(false);
  }

  return (
    <form onSubmit={enviar} className="form-grid">
      {campos.map((c) => {
        const opciones = typeof c.options === 'function' ? c.options(v) : c.options;
        return (
          <label key={c.k} className="field">
            <span>{c.label}</span>
            {opciones ? (
              <select required={c.req} value={v[c.k]} onChange={(e) => cambiar(c, e.target.value)}>
                <option value="">Elegir…</option>
                {opciones.map(([val, txt]) => (
                  <option key={val} value={val}>{txt}</option>
                ))}
              </select>
            ) : c.type === 'textarea' ? (
              <textarea required={c.req} value={v[c.k]} onChange={(e) => cambiar(c, e.target.value)} />
            ) : (
              <input
                type={c.type || 'text'}
                inputMode={c.type === 'number' ? 'decimal' : undefined}
                step={c.type === 'number' ? 'any' : undefined}
                required={c.req}
                value={v[c.k]}
                onChange={(e) => cambiar(c, e.target.value)}
              />
            )}
          </label>
        );
      })}
      {err && <div className="aviso bad" role="alert">{err}</div>}
      <button className="btn btn-primary" disabled={ocupado}>{ocupado ? 'Guardando…' : boton}</button>
    </form>
  );
}
