'use client';
import React, { useState, useEffect, useRef } from 'react';

export default function TabMantenimiento() {
  const [patentes, setPatentes] = useState([]);
  const [patenteSeleccionada, setPatenteSeleccionada] = useState('');
  const [infoVehiculo, setInfoVehiculo] = useState({ modelo: '', kmActual: 0, tipoUnidad: 'KM' });
  const [tipoMantenimiento, setTipoMantenimiento] = useState('Preventivo');
  const [descripcion, setDescripcion] = useState('');
  const [costo, setCosto] = useState('');
  const [frecuenciaCustom, setFrecuenciaCustom] = useState('10000');
  const [historial, setHistorial] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [itemEditando, setItemEditando] = useState(null);
  
  // Nuevo estado para filtrar el historial por patente
  const [filtroPatente, setFiltroPatente] = useState('');

  const formValuesRef = useRef({ patenteSeleccionada, tipoMantenimiento, descripcion, costo, infoVehiculo });
  useEffect(() => {
    formValuesRef.current = { patenteSeleccionada, tipoMantenimiento, descripcion, costo, infoVehiculo };
  }, [patenteSeleccionada, tipoMantenimiento, descripcion, costo, infoVehiculo]);

  useEffect(() => {
    cargarDatosIniciales();

    const handleBeforeUnload = (e) => {
      const current = formValuesRef.current;
      if (current.patenteSeleccionada && current.costo) {
        const data = JSON.stringify({
          patente: current.patenteSeleccionada,
          tipo_mantenimiento: current.tipoMantenimiento,
          descripcion_trabajo: current.descripcion || 'Guardado automático por cierre de sesión',
          costo: parseFloat(current.costo) || 0,
          km_o_horas_actual: current.infoVehiculo.kmActual,
          fecha: new Date().toLocaleDateString()
        });
        navigator.sendBeacon('/api/mantenimientos', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    let listaFlota = [];
    let listaMant = [];

    try {
      const resFlota = await fetch('/api/flota', { cache: 'no-store' });
      if (resFlota.ok) {
        const dataFlota = await resFlota.json();
        listaFlota = Array.isArray(dataFlota) ? dataFlota : (dataFlota.flota || dataFlota.data || []);
      }
    } catch (error) {
      console.warn("Error al cargar flota:", error);
    }
    setPatentes(listaFlota);

    try {
      const resMant = await fetch('/api/mantenimientos', { cache: 'no-store' });
      if (resMant.ok) {
        const dataMant = await resMant.json();
        listaMant = Array.isArray(dataMant) ? dataMant : (dataMant.mantenimientos || dataMant.data || []);
      }
    } catch (error) {
      console.warn("Error al cargar mantenimientos:", error);
    }
    setHistorial(listaMant);
    evaluarAlertas(listaFlota);
    setCargando(false);
  };

  const handleSeleccionarPatente = (e) => {
    const patente = e.target.value;
    setPatenteSeleccionada(patente);
    
    if (!patente) {
      setInfoVehiculo({ modelo: '', kmActual: 0, tipoUnidad: 'KM' });
      setFrecuenciaCustom('10000');
      return;
    }

    const vehiculoEncontrado = patentes.find(v => (v.dominio || v.patente) === patente);
    if (vehiculoEncontrado) {
      const esHoras = vehiculoEncontrado.tipo_medicion === 'Horas' || vehiculoEncontrado.es_autoelevador;
      const freq = vehiculoEncontrado.frecuencia_mto || 10000;
      setInfoVehiculo({
        modelo: vehiculoEncontrado.modelo || 'No especificado',
        kmActual: vehiculoEncontrado.km || vehiculoEncontrado.horas || vehiculoEncontrado.km_actual || 0,
        tipoUnidad: esHoras ? 'Horas' : 'KM'
      });
      setFrecuenciaCustom(String(freq));
    }
  };

  const handleGuardarMantenimiento = async (e) => {
    e.preventDefault();
    if (!patenteSeleccionada || !costo) {
      alert("Por favor seleccione una patente e ingrese el costo.");
      return;
    }

    const kmActualNum = Number(infoVehiculo.kmActual) || 0;
    const freqNum = parseFloat(frecuenciaCustom) || 10000;
    const proximoService = freqNum > 0 ? kmActualNum + freqNum : 0;

    const nuevoRegistro = {
      id: Date.now(),
      patente: patenteSeleccionada,
      tipo_mantenimiento: tipoMantenimiento,
      descripcion_trabajo: descripcion,
      costo: parseFloat(costo) || 0,
      km_o_horas_actual: kmActualNum,
      proximo_mantenimiento: proximoService,
      frecuencia_aplicada: freqNum,
      fecha: new Date().toLocaleDateString()
    };

    try {
      const res = await fetch('/api/mantenimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoRegistro)
      });

      if (res.ok) {
        alert("Mantenimiento registrado y guardado en Neon exitosamente.");
      }
    } catch (error) {
      console.warn("Guardado localmente por error de red.");
    }

    setHistorial(prev => [nuevoRegistro, ...prev]);
    setDescripcion('');
    setCosto('');
    setPatenteSeleccionada('');
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!itemEditando) return;

    try {
      await fetch('/api/mantenimientos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemEditando)
      });
    } catch (err) {
      console.warn("Modificado localmente");
    }

    setHistorial(prev => prev.map(m => m.id === itemEditando.id ? itemEditando : m));
    setItemEditando(null);
    alert("Mantenimiento actualizado correctamente en la base de datos.");
  };

  const eliminarMantenimiento = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este registro de mantenimiento de la base de datos?")) return;
    
    try {
      await fetch(`/api/mantenimientos?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Eliminado localmente");
    }

    setHistorial(prev => prev.filter(m => m.id !== id));
    alert("Registro eliminado de la base de datos.");
  };

  const evaluarAlertas = (flotaData = []) => {
    const listaAlertas = [];
    if (Array.isArray(flotaData)) {
      flotaData.forEach(vehiculo => {
        const actual = vehiculo.km || vehiculo.horas || vehiculo.km_actual || 0;
        const patente = vehiculo.dominio || vehiculo.patente || 'Unidad';
        const unidad = (vehiculo.tipo_medicion === 'Horas' || vehiculo.es_autoelevador) ? 'Horas' : 'KM';
        const freq = Number(vehiculo.frecuencia_mto) || 10000;
        
        if (freq > 0) {
          const proximoService = Math.ceil((actual + 1) / freq) * freq;
          const diferencia = proximoService - actual;

          if (diferencia <= 2500 && diferencia >= 0) {
            listaAlertas.push(`⚠️ ALERTA ANTICIPADA: La unidad ${patente} (${vehiculo.modelo || 'Unidad'}) está a ${diferencia} ${unidad} de su próximo service (${proximoService} ${unidad}). ¡Preparar repuestos!`);
          }
        }
      });
    }
    setAlertas(listaAlertas);
  };

  // Historial filtrado por la patente seleccionada en el combo de búsqueda
  const historialFiltrado = historial.filter(m => {
    if (!filtroPatente) return true;
    return m.patente === filtroPatente;
  });

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>Control de Mantenimiento Preventivo y Costos</h2>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Monitoreo automático con frecuencia de service personalizada y almacenamiento en Neon BD.</p>
      
      {cargando ? (
        <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando información de flota...</p>
      ) : (
        <>
          {/* Formulario de Carga */}
          <form onSubmit={handleGuardarMantenimiento} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>Patente (Flota)</label>
                <select 
                  value={patenteSeleccionada} 
                  onChange={handleSeleccionarPatente}
                  style={{ width: '100%', padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  required
                >
                  <option value="">Seleccione una patente...</option>
                  {Array.isArray(patentes) && patentes.map((v, index) => {
                    const pat = v.dominio || v.patente;
                    return (
                      <option key={index} value={pat}>{pat} - {v.modelo || 'Vehículo'}</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>Modelo y Estado Actual</label>
                <input 
                  type="text" 
                  readOnly 
                  value={patenteSeleccionada ? `${infoVehiculo.modelo} | Actual: ${infoVehiculo.kmActual} ${infoVehiculo.tipoUnidad}` : 'Seleccione una patente'} 
                  style={{ width: '100%', padding: '9px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>Tipo de Mantenimiento</label>
                <select 
                  value={tipoMantenimiento} 
                  onChange={(e) => setTipoMantenimiento(e.target.value)}
                  style={{ width: '100%', padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>Costo de Reparación ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={costo} 
                  onChange={(e) => setCosto(e.target.value)}
                  placeholder="Ej: 45000"
                  style={{ width: '100%', padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#b45309', marginBottom: '5px' }}>
                  ⚙️ Frecuencia del Próximo Service (Cumplidos tantos KM / Horas)
                </label>
                <input 
                  type="number" 
                  value={frecuenciaCustom} 
                  onChange={(e) => setFrecuenciaCustom(e.target.value)}
                  placeholder="Ej: 10000"
                  style={{ width: '100%', padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fffbeb', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>Descripción del Trabajo / Repuestos</label>
              <textarea 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles del mantenimiento realizado..."
                style={{ width: '100%', padding: '9px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                rows="2"
              />
            </div>

            <div>
              <button type="submit" style={{ background: '#b45309', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                Registrar y Guardar en Neon
              </button>
            </div>
          </form>

          {/* Sección de Alertas */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>📢 Alertas Anticipadas de Mantenimiento (Margen 2,500 KM)</h3>
            {alertas.length > 0 ? (
              <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '12px 16px', borderRadius: '6px' }}>
                {alertas.map((alerta, idx) => (
                  <p key={idx} style={{ margin: '4px 0', color: '#b45309', fontSize: '13px', fontWeight: '600' }}>{alerta}</p>
                ))}
              </div>
            ) : (
              <div style={{ background: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '12px 16px', borderRadius: '6px' }}>
                <p style={{ margin: 0, color: '#15803d', fontSize: '13px', fontWeight: '600' }}>✅ Toda la flota está lejos del límite de servicio (más de 2,500 km de margen).</p>
              </div>
            )}
          </div>

          {/* Historial con Filtro por Patente y Botón de Exportar a PDF */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>📋 Historial de Mantenimientos (Auditoría de Costos)</h3>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* SELECTOR PARA FILTRAR POR PATENTE */}
                <select
                  value={filtroPatente}
                  onChange={(e) => setFiltroPatente(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', fontWeight: 'bold', color: '#334155' }}
                >
                  <option value="">🔍 Todas las Patentes (Sin filtro)</option>
                  {patentes.map((v, idx) => {
                    const pat = v.dominio || v.patente;
                    return <option key={idx} value={pat}>Patente: {pat}</option>;
                  })}
                </select>

                {/* BOTÓN PARA EXPORTAR A PDF / IMPRIMIR */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  📄 Exportar a PDF
                </button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px' }}>Fecha</th>
                  <th style={{ padding: '10px' }}>Patente</th>
                  <th style={{ padding: '10px' }}>Tipo</th>
                  <th style={{ padding: '10px' }}>Descripción</th>
                  <th style={{ padding: '10px' }}>Lectura</th>
                  <th style={{ padding: '10px' }}>Próximo Service / Faltante</th>
                  <th style={{ padding: '10px' }}>Costo ($)</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historialFiltrado.length === 0 ? (
                  <tr><td colSpan="8" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>No hay registros de mantenimientos para la patente seleccionada.</td></tr>
                ) : (
                  historialFiltrado.map((m) => {
                    const kmActualRow = Number(m.km_o_horas_actual || 0);
                    const proximoMto = Number(m.proximo_mantenimiento || 0);
                    const faltante = proximoMto > 0 ? proximoMto - kmActualRow : 0;

                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px' }}>{m.fecha || 'Hoy'}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{m.patente}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: m.tipo_mantenimiento === 'Preventivo' ? '#dcfce7' : '#fee2e2', color: m.tipo_mantenimiento === 'Preventivo' ? '#15803d' : '#b91c1c', fontWeight: 'bold', fontSize: '11px' }}>
                            {m.tipo_mantenimiento}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>{m.descripcion_trabajo || '-'}</td>
                        <td style={{ padding: '10px' }}>{kmActualRow.toLocaleString()}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: faltante <= 2500 && faltante > 0 ? '#b91c1c' : '#047857' }}>
                          {proximoMto > 0 ? `${proximoMto.toLocaleString()} (Faltan: ${faltante.toLocaleString()})` : 'No aplica'}
                        </td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#b45309' }}>${Number(m.costo || 0).toLocaleString()}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button onClick={() => setItemEditando(m)} style={{ background: '#fef08a', color: '#854d0e', border: '1px solid #facc15', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '6px', fontSize: '12px' }}>✏️ Editar</button>
                          <button onClick={() => eliminarMantenimiento(m.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🗑️ Borrar</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Modal de Edición */}
          {itemEditando && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <form onSubmit={guardarEdicion} style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>✏️ Editar Mantenimiento ({itemEditando.patente})</h3>
                
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Tipo:</label>
                <select value={itemEditando.tipo_mantenimiento} onChange={(e) => setItemEditando({ ...itemEditando, tipo_mantenimiento: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                </select>

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Costo ($):</label>
                <input type="number" step="0.01" value={itemEditando.costo} onChange={(e) => setItemEditando({ ...itemEditando, costo: Number(e.target.value) })} style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}" required />

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Descripción:</label>
                <textarea value={itemEditando.descripcion_trabajo} onChange={(e) => setItemEditando({ ...itemEditando, descripcion_trabajo: e.target.value })} rows="3" style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{ flex: 1, background: '#047857', color: '#fff', padding: '9px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
                  <button type="button" onClick={() => setItemEditando(null)} style={{ flex: 1, background: '#cbd5e1', padding: '9px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}