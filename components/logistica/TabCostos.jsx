'use client';
import React from 'react';

export default function TabCostos({
  listaTodasPatentes,
  flotaMantenimientoFiltrada,
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
  flotaVehiculos,
  flotaMantenimientoBD
}) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>🛠️ Control de Mantenimiento Preventivo y Costos</h3>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Monitoreo automático de kilometrajes, horas de uso y costos asociados.</p>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#b45309', fontSize: '16px' }}>📝 Registrar / Actualizar Uso (Km/Horas), Service y Costos</h4>
        <form onSubmit={guardarVehiculoMantenimiento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Patente/ID:</label>
            <select 
              value={nuevaPatenteMto} 
              onChange={(e) => {
                const pat = e.target.value;
                setNuevaPatenteMto(pat);
                const veh = flotaMantenimientoBD.find(v => v.patente === pat) || flotaVehiculos.find(v => v.dominio === pat);
                if (veh) {
                  setNuevoModeloMto(veh.modelo || '');
                  setNuevoKmActualMto(veh.km_actual || veh.km || veh.horas || '');
                  setNuevaFrecuenciaMto(veh.frecuencia_mto || (veh.tipoMedicion === 'Horas' ? 250 : 15000));
                  setNuevoUltimoMtoKm(veh.km_ultimo_service || 0);
                  setNuevoCostoMto(veh.costo_mantenimiento || 0);
                }
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontWeight: 'bold' }}
              required
            >
              <option value="">-- Seleccionar Patente --</option>
              {listaTodasPatentes.map((pat, idx) => (
                <option key={idx} value={pat}>{pat}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Modelo:</label>
            <input type="text" placeholder="Ej: IVECO" value={nuevoModeloMto} onChange={(e) => setNuevoModeloMto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Km / Horas Actuales:</label>
            <input type="number" placeholder="124500" value={nuevoKmActualMto} onChange={(e) => setNuevoKmActualMto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Frecuencia Service:</label>
            <input type="number" value={nuevaFrecuenciaMto} onChange={(e) => setNuevaFrecuenciaMto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Lectura Último Service:</label>
            <input type="number" placeholder="115000" value={nuevoUltimoMtoKm} onChange={(e) => setNuevoUltimoMtoKm(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Costo Mantenimiento ($):</label>
            <input type="number" placeholder="Ej: 85000" value={nuevoCostoMto} onChange={(e) => setNuevoCostoMto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#b45309', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar / Actualizar</button>
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Filtrar reporte por Patente:</label>
          <select value={filtroPatenteMto} onChange={(e) => setFiltroPatenteMto(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px', fontWeight: 'bold' }}>
            <option value="">Todas las patentes</option>
            {listaTodasPatentes.map((pat, idx) => (
              <option key={idx} value={pat}>{pat}</option>
            ))}
          </select>
        </div>
        <button onClick={exportarMantenimientoExcel} style={{ backgroundColor: '#15803d', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>📥 Descargar Mantenimiento a Excel (.xlsx)</button>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
              <th style={{ padding: '10px' }}>Patente</th>
              <th style={{ padding: '10px' }}>Modelo</th>
              <th style={{ padding: '10px' }}>Lectura Actual</th>
              <th style={{ padding: '10px' }}>Próximo Service</th>
              <th style={{ padding: '10px' }}>Costo Acumulado</th>
              <th style={{ padding: '10px' }}>Estado / Alerta</th>
            </tr>
          </thead>
          <tbody>
            {flotaMantenimientoFiltrada.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '15px', textAlign: 'center', color: '#64748b' }}>No hay registros de mantenimiento.</td></tr>
            ) : (
              flotaMantenimientoFiltrada.map((v, idx) => {
                const kmActual = Number(v.km_actual || 0);
                const ultimoMto = Number(v.km_ultimo_service || 0);
                const frecuencia = Number(v.frecuencia_mto || 15000);
                const proximoServiceKm = ultimoMto + frecuencia;
                const kmRestantes = proximoServiceKm - kmActual;
                const enAlerta = kmRestantes <= 2500;
                const vencido = kmRestantes <= 0;

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: vencido ? '#fee2e2' : enAlerta ? '#fef9c3' : '#fff' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>{v.patente}</td>
                    <td style={{ padding: '10px' }}>{v.modelo}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#0284c7' }}>{kmActual}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{proximoServiceKm}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#b91c1c' }}>${Number(v.costo_mantenimiento || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      {vencido ? <span style={{ backgroundColor: '#b91c1c', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>⚠️ ¡VENCIDO!</span> :
                       enAlerta ? <span style={{ backgroundColor: '#ca8a04', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>🚨 ALERTA</span> :
                       <span style={{ backgroundColor: '#166534', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>✅ En Vigencia</span>}
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