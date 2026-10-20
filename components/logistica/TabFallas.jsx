'use client';
import React from 'react';

export default function TabFallas({ fallas = [] }) {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
      <h3>⚠️ Fallas Reportadas en Ruta</h3>
      {fallas.length === 0 ? <p style={{ color: '#64748b' }}>No hay fallas reportadas actualmente.</p> : null}
    </div>
  );
}