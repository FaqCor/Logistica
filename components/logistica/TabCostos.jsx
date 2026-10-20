'use client';
import React from 'react';

export default function TabCostos({
  nuevaPatenteMto, setNuevaPatenteMto,
  nuevoCostoMto, setNuevoCostoMto,
  guardarVehiculoMantenimiento, flotaVehiculos = []
}) {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
      <h3>🛠️ Control de Mantenimiento Preventivo</h3>
      <form onSubmit={guardarVehiculoMantenimiento} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Vehículo:</label>
          <select value={nuevaPatenteMto} onChange={(e) => setNuevaPatenteMto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="">Seleccionar...</option>
            {flotaVehiculos.map((v, i) => <option key={i} value={v.dominio}>{v.dominio} - {v.modelo}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Costo ($):</label>
          <input type="number" placeholder="Ej. 120000" value={nuevoCostoMto} onChange={(e) => setNuevoCostoMto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" style={{ background: '#b45309', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Guardar Mantenimiento</button>
        </div>
      </form>
    </div>
  );
}
