'use client';
import React from 'react';

export default function TabPedidos({ listaReportes = [], exportarReporteExcel }) {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>📊 Reporte Histórico de Pedidos</h3>
        <button onClick={exportarReporteExcel} style={{ background: '#047857', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📥 Exportar a Excel</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '8px' }}># ID</th>
            <th style={{ padding: '8px' }}>Cliente</th>
            <th style={{ padding: '8px' }}>Destino</th>
            <th style={{ padding: '8px' }}>Bultos</th>
            <th style={{ padding: '8px' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {listaReportes.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>#{p.id}</td>
              <td style={{ padding: '8px' }}>{p.cliente || p.Cliente}</td>
              <td style={{ padding: '8px' }}>{p.direccion || p.Direccion}</td>
              <td style={{ padding: '8px' }}>{p.bultos || 1}</td>
              <td style={{ padding: '8px' }}>{p.estado_entrega || 'Pendiente'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}