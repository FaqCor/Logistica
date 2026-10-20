'use client';
import React from 'react';

export default function TabCostos({
  listaTodasPatentes = [],
  flotaMantenimientoFiltrada = [],
  nuevaPatenteMto, setNuevaPatenteMto,
  nuevoModeloMto, setNuevoModeloMto,
  nuevoKmActualMto, setNuevoKmActualMto,
  nuevaFrecuenciaMto, setNuevaFrecuenciaMto,
  nuevoUltimoMtoKm, setNuevoUltimoMtoKm,
  nuevoCostoMto, setNuevoCostoMto,
  guardarVehiculoMantenimiento,
  filtroPatenteMto, setFiltroPatenteMto,
  exportarMantenimientoExcel,
  flotaVehiculos = []
}) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}>
      
      {/* ENCABEZADO */}
      <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
        🛠️ Control de Mantenimiento Preventivo y Costos[cite: 10]
      </h3>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        Monitoreo automático de kilometrajes, horas de uso y costos asociados al mantenimiento de la flota.[cite: 10]
      </p>

      {/* FORMULARIO DE REGISTRO / ACTUALIZACIÓN */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#b45309', fontSize: '16px', fontWeight: 'bold' }}>
          📝 Registrar / Actualizar Uso (Km/Horas), Service y Costos[cite: 10]
        </h4>
        
        <form onSubmit={guardarVehiculoMantenimiento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
              Patente/ID:[cite: 10]
            </label>
            <select 
              value={nuevaPatenteMto} 
              onChange={(e) => setNuevaPatenteMto(e.target.value)} 
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px', fontWeight: 'bold' }}
              required
            >
              <option value="">-- Seleccionar Patente --</option>[cite: 10]
              {listaTodasPatentes.map((pat, idx) => (
                <option key={idx} value={pat}>{pat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
              Modelo:[cite: 10]
            </label>
            <input 
              type="text" 
              placeholder="Ej: IVECO / Toyota"[cite: 10]
              value={nuevoModeloMto} 
              onChange={(e) => setNuevoModeloMto(e.target.value)} 
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
              Km / Horas Actuales:[cite: 10]
            </label>
            <input 
              type="number" 
              placeholder="124500 o 1250"[cite: 10]
              value={nuevoKmActualMto} 
              onChange={(e) => setNuevoKmActualMto(e.target.value)} 
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
              Frecuencia Service:[cite: 10]
            </label>
            <input 
              type="number" 
              value={nuevaFrecuenciaMto} 
              onChange={(e) => setNuevaFrecuenciaMto(e.target.value)} 
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
              Lectura Último Service:[cite: 10]
            </label>
            <input 
              type="number" 
              placeholder="115000"[cite: 10]
              value={nuevoUltimoMtoKm} 
              onChange={(e) => setNuevoUltimoMtoKm(e.target.value)} 
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
              Costo Mantenimiento ($):[cite: 10]
            </label>
            <input 
              type="number" 
              placeholder="Ej: 85000"[cite: 10]
              value={nuevoCostoMto} 
              onChange={(e) => setNuevoCostoMto(e.target.value)} 
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
            <button 
              type="submit" 
              style={{ width: '100%', padding: '11px', backgroundColor: '#b45309', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Guardar / Actualizar[cite: 10]
            </button>
          </div>

        </form>
      </div>

      {/* FILTROS Y BOTÓN DE EXPORTACIÓN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>
            Filtrar reporte por Patente:[cite: 10]
          </label>
          <select 
            value={filtroPatenteMto} 
            onChange={(e) => setFiltroPatenteMto(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px', fontWeight: 'bold' }}
          >
            <option value="">Todas las patentes</option>[cite: 10]
            {listaTodasPatentes.map((pat, idx) => (
              <option key={idx} value={pat}>{pat}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={exportarMantenimientoExcel}
          style={{ backgroundColor: '#15803d', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
        >
          📥 Descargar Mantenimiento a Excel (.xlsx)[cite: 10]
        </button>
      </div>

      {/* TABLA DE MANTENIMIENTO */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
              <th style={{ padding: '12px' }}>Patente</th>[cite: 10]
              <th style={{ padding: '12px' }}>Modelo</th>[cite: 10]
              <th style={{ padding: '12px' }}>Lectura Actual</th>[cite: 10]
              <th style={{ padding: '12px' }}>Próximo Service</th>[cite: 10]
              <th style={{ padding: '12px' }}>Costo Acumulado</th>[cite: 10]
              <th style={{ padding: '12px' }}>Estado / Alerta</th>[cite: 10]
            </tr>
          </thead>
          <tbody>
            {flotaMantenimientoFiltrada.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  No hay registros de mantenimiento disponibles.
                </td>
              </tr>
            ) : (
              flotaMantenimientoFiltrada.map((v, idx) => {
                const kmActual = Number(v.km_actual || v.km || 0);
                const ultimoMto = Number(v.km_ultimo_service || 0);
                const frecuencia = Number(v.frecuencia_mto || 15000);
                const proximoServiceKm = ultimoMto + frecuencia;
                const kmRestantes = proximoServiceKm - kmActual;
                
                const enAlerta = kmRestantes <= 2500 && kmRestantes > 0;
                const vencido = kmRestantes <= 0;

                return (
                  <tr 
                    key={idx} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9', 
                      backgroundColor: vencido ? '#fef2f2' : enAlerta ? '#fefce8' : '#fff' 
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>{v.patente || v.dominio}</td>[cite: 10]
                    <td style={{ padding: '12px' }}>{v.modelo || '-'}</td>[cite: 10]
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#0284c7' }}>{kmActual.toLocaleString()}</td>[cite: 10]
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{proximoServiceKm.toLocaleString()}</td>[cite: 10]
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#b91c1c' }}>${Number(v.costo_mantenimiento || 0).toLocaleString()}</td>[cite: 10]
                    <td style={{ padding: '12px' }}>
                      {vencido ? (
                        <span style={{ backgroundColor: '#b91c1c', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          ⚠️ ¡VENCIDO![cite: 10]
                        </span>
                      ) : enAlerta ? (
                        <span style={{ backgroundColor: '#ca8a04', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          🚨 ALERTA ({kmRestantes})[cite: 10]
                        </span>
                      ) : (
                        <span style={{ backgroundColor: '#166534', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          ✅ En Vigencia[cite: 10]
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}