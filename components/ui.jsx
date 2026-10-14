'use client';

export const ESTADOS = {
  entregado: ['Entregado', 'ok'],
  pendiente: ['Pendiente', 'warn'],
  no_entregado: ['No entregado', 'bad'],
};

export function Badge({ estado }) {
  const [texto, clase] = ESTADOS[estado] || [estado, ''];
  return <span className={`badge ${clase}`}>{texto}</span>;
}

export function Aviso({ msg, tipo = 'bad' }) {
  return msg ? <div className={`aviso ${tipo}`} role={tipo === 'bad' ? 'alert' : 'status'}>{msg}</div> : null;
}

export function Seg({ value, onChange, options, className = '' }) {
  return (
    <div className={`seg ${className}`}>
      {options.map(([v, etiqueta]) => (
        <button type="button" key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
          {etiqueta}
        </button>
      ))}
    </div>
  );
}

export function Patente({ children, chica }) {
  return <span className={`patente ${chica ? 'sm' : ''}`}>{children}</span>;
}
