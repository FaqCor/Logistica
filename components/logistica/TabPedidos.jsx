'use client';
import React from 'react';

export default function TabPedidos({ listaReportes = [], exportarReporteExcel }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>📊 Reporte Histórico de Pedidos y Entregas</h3>
        <button onClick={exportarReporteExcel} style={{ backgroundColor: '#047857', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
          📥 Exportar Reporte a Excel
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px' }}># ID</th>
              <th style={{ padding: '10px' }}>Cliente</th>
              <th style={{ padding: '10px' }}>Destino</th>
              <th style={{ padding: '10px' }}>Bultos</th>
              <th style={{ padding: '10px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {listaReportes.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>#{p.id}</td>
                <td style={{ padding: '10px' }}>{p.cliente || p.Cliente}</td>
                <td style={{ padding: '10px' }}>{p.direccion || p.Direccion} ({p.provincia || 'Salta'})</td>
                <td style={{ padding: '10px' }}>{p.bultos || 1}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ backgroundColor: p.estado_entrega === 'Entregado' ? '#dcfce7' : '#fef3c7', color: p.estado_entrega === 'Entregado' ? '#15803d' : '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                    {p.estado_entrega || 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}