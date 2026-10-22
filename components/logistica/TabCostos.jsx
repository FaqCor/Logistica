'use client';
import React, { useState, useEffect } from 'react';

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
  // Estados para el reporte en vivo de entregas, estados y cobranzas
  const [reportesEntrega, setReportesEntrega] = useState([]);
  const [cargandoReportes, setCargandoReportes] = useState(true);

  useEffect(() => {
    cargarReportesEnVivo();
  }, []);

  const cargarReportesEnVivo = async () => {
    try {
      setCargandoReportes(true);
      const res = await fetch('/api/registros-entrega', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setReportesEntrega(Array.isArray(data) ? data : (data.reportes || data.data || []));
      }
    } catch (error) {
      console.warn("Error al cargar registros de entrega:", error);
    } finally {
      setCargandoReportes(false);
    }
  };

  const exportarReporteExcel = () => {
    alert("Exportando reporte detallado de cierres a Excel...");
  };

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
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '35px' }}>
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

      {/* NUEVA SECCIÓN: REPORTE EN VIVO DE CIERRES, ESTADOS Y COBRANZAS */}
      <div style={{ marginTop: '40px', borderTop: '2px dashed #cbd5e1', paddingTop: '25px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
              📊 Reporte General de Cierres y Cobranzas en Tiempo Real
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Estados de entrega en vivo (Entregado, No entregado, Pendiente) y desglose de medios de pago (Efectivo, Transferencia, Cheques).
            </p>
          </div>

          <button 
            onClick={exportarReporteExcel}
            style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            📥 Exportar Reporte a Excel (.xlsx)
          </button>
        </div>

        {cargandoReportes ? (
          <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '13px' }}>Cargando cierres de viajes en vivo desde Neon...</p>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '10px' }}>Fecha</th>
                  <th style={{ padding: '10px' }}>Nº Pedido</th>
                  <th style={{ padding: '10px' }}>Cliente</th>
                  <th style={{ padding: '10px' }}>Provincia</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Efectivo ($)</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Transferencia ($)</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Cheques ($)</th>
                  <th style={{ padding: '10px', textAlign: 'right', backgroundColor: '#065f46' }}>Total Cobrado</th>
                </tr>
              </thead>
              <tbody>
                {reportesEntrega.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                      No hay registros de cierres o entregas en vivo en la base de datos todavía.
                    </td>
                  </tr>
                ) : (
                  reportesEntrega.map((row, idx) => {
                    const estadoColor = 
                      row.estado === 'Entregado' ? { bg: '#d1fae5', text: '#065f46' } :
                      row.estado === 'No entregado' ? { bg: '#fee2e2', text: '#991b1b' } :
                      { bg: '#fef3c7', text: '#b45309' }; // Pendiente por defecto

                    const efectivo = Number(row.efectivo || 0);
                    const transferencia = Number(row.transferencia || 0);
                    const cheques = Number(row.cheques || 0);
                    const totalCobrado = efectivo + transferencia + cheques;

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '10px', color: '#475569' }}>{row.fecha || 'Reciente'}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#0f172a' }}>{row.n_pedido || '#---'}</td>
                        <td style={{ padding: '10px', color: '#334155' }}>{row.cliente || '-'}</td>
                        <td style={{ padding: '10px', color: '#64748b' }}>{row.provincia || 'N/A'}</td>
                        
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: estadoColor.bg, 
                            color: estadoColor.text, 
                            padding: '3px 8px', 
                            borderRadius: '4px', 
                            fontWeight: 'bold',
                            fontSize: '11px'
                          }}>
                            {row.estado || 'Pendiente'}
                          </span>
                        </td>

                        <td style={{ padding: '10px', textAlign: 'right', color: '#047857' }}>${efectivo.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#2563eb' }}>${transferencia.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#7c3aed' }}>${cheques.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#065f46', backgroundColor: '#ecfdf5' }}>
                          ${totalCobrado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}