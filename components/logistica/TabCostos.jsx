'use client';
import React from 'react';

export default function TabCostos({
  listaTodasPatentes = [],
  flotaMantenimientoFiltrada = [],
  nuevaPatenteMto,
  setNuevaPatenteMto,
  nuevoModeloMto,
  setNuevoModeloMto,
  nuevoKmActualMto,
  setNuevoKmActualMto,
  nuevaFrecuenciaMto,
  setNuevaFrecuenciaMto,
  nuevoUltimoMtoKm,
  setNuevoUltimoMtoKm,
  nuevoCostoMto,
  setNuevoCostoMto,
  guardarVehiculoMantenimiento,
  filtroPatenteMto,
  setFiltroPatenteMto,
  exportarMantenimientoExcel,
  flotaVehiculos = []
}) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>🛠️ Control de Mantenimiento Preventivo y Reparaciones</h3>
      
      <form onSubmit={guardarVehiculoMantenimiento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Vehículo (Patente):</label>
          <select value={nuevaPatenteMto} onChange={(e) => setNuevaPatenteMto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="">Seleccionar...</option>
            {flotaVehiculos.map((v, i) => (
              <option key={i} value={v.dominio}>{v.dominio} - {v.modelo}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Costo ($):</label>
          <input type="number" placeholder="Ej. 120000" value={nuevoCostoMto} onChange={(e) => setNuevoCostoMto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" style={{ padding: '9px 18px', backgroundColor: '#b45309', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Registrar Mantenimiento</button>
        </div>
      </form>
    </div>
  );
}