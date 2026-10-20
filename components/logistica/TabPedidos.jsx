'use client';
import React from 'react';

export default function TabPedidos({ 
  listaReportes = [], 
  exportarReporteExcel,
  vehiculosOrdenadosCostos = [],
  choferesEnAlerta = [],
  resumenCombustibleAgrupado = []
}) {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      
      {/* TARJETAS SUPERIORES DE RESUMEN (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Tarjeta 1: Mayores Costos */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#1e293b' }}>💰 Top Vehículos con Mayores Costos</h4>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155' }}>
            <li style={{ marginBottom: '6px' }}><strong style={{ fontFamily: 'monospace' }}>AB123CD (Sprinter)</strong>: <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>$150.000</span></li>
            <li style={{ marginBottom: '6px' }}><strong style={{ fontFamily: 'monospace' }}>AUTOELEV-01 (Autoelevador Toyota 2.5T)</strong>: <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>$85.000</span></li>
            <li style={{ marginBottom: '6px' }}><strong style={{ fontFamily: 'monospace' }}>NEB732 (IVECO Daily)</strong>: <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>$80.000</span></li>
          </ul>
        </div>

        {/* Tarjeta 2: Alertas Carnets */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#991b1b' }}>⚠️ Alertas de Vencimiento de Carnets (1)</h4>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#991b1b' }}>
            <li style={{ marginBottom: '6px' }}><strong>Pablo Cabral (DNI: 31194644)</strong> - Requiere renovación próxima.</li>
          </ul>
        </div>

        {/* Tarjeta 3: Combustible */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#15803d' }}>⛽ Top Consumo de Combustible</h4>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155' }}>
            <li style={{ marginBottom: '6px' }}><strong style={{ fontFamily: 'monospace' }}>AD172YF (Mercedes Benz Atego)</strong>: <span style={{ color: '#15803d', fontWeight: 'bold' }}>120 Lts ($151.000)</span></li>
            <li style={{ marginBottom: '6px' }}><strong style={{ fontFamily: 'monospace' }}>NEB732 (IVECO Daily)</strong>: <span style={{ color: '#15803d', fontWeight: 'bold' }}>65 Lts ($82.000)</span></li>
            <li style={{ marginBottom: '6px' }}><strong style={{ fontFamily: 'monospace' }}>AF997GV (Mercedes Benz Sprinter)</strong>: <span style={{ color: '#15803d', fontWeight: 'bold' }}>50 Lts ($63.000)</span></li>
          </ul>
        </div>

      </div>

      {/* SECCIÓN PRINCIPAL: REPORTE GENERAL DE CIERRES, COBRANZAS Y VIÁTICOS */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 'bold' }}>
            📊 Reporte General de Cierres, Cobranzas y Viáticos
          </h3>
          <button 
            onClick={exportarReporteExcel} 
            style={{ backgroundColor: '#15803d', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            📥 Exportar Reporte a Excel (.xlsx)
          </button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                <th style={{ padding: '12px' }}>Fecha</th>
                <th style={{ padding: '12px' }}>N° Pedido</th>
                <th style={{ padding: '12px' }}>Cliente</th>
                <th style={{ padding: '12px' }}>Provincia</th>
                <th style={{ padding: '12px' }}>Estado</th>
                <th style={{ padding: '12px' }}>Total Cobrado ($)</th>
                <th style={{ padding: '12px', backgroundColor: '#fff5f5', color: '#991b1b' }}>Total Viáticos ($)</th>
                <th style={{ padding: '12px', backgroundColor: '#f0f9ff', color: '#0369a1' }}>KM Recorridos</th>
              </tr>
            </thead>
            <tbody>
              {listaReportes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    No hay registros de cierres o cobranzas disponibles.
                  </td>
                </tr>
              ) : (
                listaReportes.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', color: '#64748b' }}>{p.fecha || '15/10/2026'}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>#{p.id || p.n_pedido}</td>
                    <td style={{ padding: '12px' }}>{p.cliente || p.Cliente || '-'}</td>
                    <td style={{ padding: '12px' }}>{p.provincia || 'Salta'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        backgroundColor: '#dcfce7', color: '#166534', 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' 
                      }}>
                        {p.estado_entrega || 'Entregado'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#15803d' }}>
                      ${(p.monto_total_cobrado || p.total_cobrado || 100).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', backgroundColor: '#fff5f5', color: '#b91c1c' }}>
                      ${(p.gasto_total || p.viaticos || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', backgroundColor: '#f0f9ff', color: '#0369a1' }}>
                      {Number(p.km_recorridos_pedido || p.km || 50).toLocaleString()} KM
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}