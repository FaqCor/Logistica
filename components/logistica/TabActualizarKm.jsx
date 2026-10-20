'use client';
import React from 'react';

export default function TabActualizarKm({
  listaTodasPatentes = [],
  patenteRapidaKm,
  setPatenteRapidaKm,
  valorRapidoKm,
  setValorRapidoKm,
  actualizarKmRapido,
  flotaVehiculos = [],
  flotaMantenimientoBD = []
}) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}>
      
      {/* ENCABEZADO */}
      <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
        ⏱️ Actualizar Lectura de Transporte (KM / Horas)[cite: 11]
      </h3>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        Selecciona cualquier vehículo/autoelevador de la flota e ingresa su nuevo odómetro/horómetro. La actualización se propagará a todas las demás pestañas automáticamente.[cite: 11]
      </p>

      {/* CONTENEDOR DEL FORMULARIO */}
      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '24px', maxWidth: '650px' }}>
        <form onSubmit={actualizarKmRapido}>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#92400e', marginBottom: '6px' }}>
              Seleccionar Unidad / Patente:[cite: 11]
            </label>
            <select 
              value={patenteRapidaKm} 
              onChange={(e) => setPatenteRapidaKm(e.target.value)} 
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', fontWeight: 'bold' }} 
              required
            >
              <option value="">-- Selecciona una Patente --</option>[cite: 11]
              {listaTodasPatentes.map((pat, idx) => {
                const obj = flotaVehiculos.find(v => v.dominio === pat) || flotaMantenimientoBD.find(v => v.patente === pat);
                const lectura = obj?.km || obj?.horas || obj?.km_actual || 0;
                return (
                  <option key={idx} value={pat}>
                    🚘 {pat} ({obj?.modelo || 'Unidad'}) - Actual: {lectura}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#92400e', marginBottom: '6px' }}>
              Nueva Lectura (KM / Horas de Trabajo):[cite: 11]
            </label>
            <input 
              type="number" 
              placeholder="Ej: 125000 o 1300"[cite: 11]
              value={valorRapidoKm} 
              onChange={(e) => setValorRapidoKm(e.target.value)} 
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 'bold', backgroundColor: '#fff' }} 
              required 
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '12px', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
          >
            ⚡ Actualizar Lectura en Todas las Pestañas[cite: 11]
          </button>

        </form>
      </div>

    </div>
  );
}