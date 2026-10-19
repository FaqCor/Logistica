'use client';
import React from 'react';

export default function TabPedidos({ listaReportes, exportarReporteExcel }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>📊 Reporte General de Cierres, Cobranzas y Viáticos</h3>
        <button onClick={exportarReporteExcel} style={{ backgroundColor: '#15803d', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>📥 Exportar Reporte a Excel (.xlsx)</button>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
              <th style={{ padding: '10px' }}>Fecha</th>
              <th style={{ padding: '10px' }}>N° Pedido</th>
              <th style={{ padding: '10px' }}>Cliente</th>
              <th style={{ padding: '10px' }}>Provincia</th>
              <th style={{ padding: '10px' }}>Estado</th>
              <th style={{ padding: '10px' }}>Total Cobrado ($)</th>
              <th style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#991b1b' }}>Total Viáticos ($)</th>
              <th style={{ padding: '10px', backgroundColor: '#eff6ff', color: '#1e40af' }}>KM Recorridos</th>
            </tr>
          </thead>
          <tbody>
            {listaReportes.map((p, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', color: '#64748b' }}>{p.fecha_cierre ? new Date(p.fecha_cierre).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>#{p.id}</td>
                <td style={{ padding: '10px' }}>{p.cliente || p.Cliente}</td>
                <td style={{ padding: '10px' }}>{p.provincia || 'Salta'}</td>
                <td style={{ padding: '10px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: p.estado_entrega === 'Entregado' ? '#dcfce7' : '#fef9c3', color: p.estado_entrega === 'Entregado' ? '#166534' : '#854d0e' }}>{p.estado_entrega || 'Pendiente'}</span></td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: '#15803d' }}>${p.monto_total_cobrado || 0}</td>
                <td style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#fff5f5', color: '#b91c1c' }}>${p.gasto_total || 0}</td>
                <td style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#f0f9ff', color: '#0369a1' }}>{Number(p.km_recorridos_pedido || p.kmDesdeCD || 0)} KM</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}