'use client';
import React, { useState, useEffect } from 'react';

export default function TabMantenimiento() {
  const [patentes, setPatentes] = useState([]);
  const [patenteSeleccionada, setPatenteSeleccionada] = useState('');
  const [infoVehiculo, setInfoVehiculo] = useState({ modelo: '', kmActual: 0, tipoUnidad: 'KM' });
  const [tipoMantenimiento, setTipoMantenimiento] = useState('Preventivo');
  const [descripcion, setDescripcion] = useState('');
  const [costo, setCosto] = useState('');
  const [historial, setHistorial] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatosIniciales();
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
      return;
    }

    const vehiculoEncontrado = patentes.find(v => (v.dominio || v.patente) === patente);
    if (vehiculoEncontrado) {
      const esHoras = vehiculoEncontrado.tipo_medicion === 'Horas' || vehiculoEncontrado.es_autoelevador;
      setInfoVehiculo({
        modelo: vehiculoEncontrado.modelo || 'No especificado',
        kmActual: vehiculoEncontrado.km || vehiculoEncontrado.horas || vehiculoEncontrado.km_actual || 0,
        tipoUnidad: esHoras ? 'Horas' : 'KM'
      });
    }
  };

  const handleGuardarMantenimiento = async (e) => {
    e.preventDefault();
    if (!patenteSeleccionada || !costo) {
      alert("Por favor seleccione una patente e ingrese el costo.");
      return;
    }

    const nuevoRegistro = {
      patente: patenteSeleccionada,
      tipo_mantenimiento: tipoMantenimiento,
      descripcion_trabajo: descripcion,
      costo: parseFloat(costo) || 0,
      km_o_horas_actual: Number(infoVehiculo.kmActual) || 0,
      proximo_mantenimiento_km: Number(infoVehiculo.kmActual) + 10000,
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
        setDescripcion('');
        setCosto('');
        cargarDatosIniciales();
      } else {
        alert("Registro guardado localmente en pantalla.");
        setHistorial(prev => [nuevoRegistro, ...prev]);
        setDescripcion('');
        setCosto('');
      }
    } catch (error) {
      console.error("Error de red:", error);
      setHistorial(prev => [nuevoRegistro, ...prev]);
      setDescripcion('');
      setCosto('');
    }
  };

  const evaluarAlertas = (flotaData = []) => {
    const listaAlertas = [];
    if (Array.isArray(flotaData)) {
      flotaData.forEach(vehiculo => {
        const actual = vehiculo.km || vehiculo.horas || vehiculo.km_actual || 0;
        const patente = vehiculo.dominio || vehiculo.patente || 'Unidad';
        const unidad = (vehiculo.tipo_medicion === 'Horas' || vehiculo.es_autoelevador) ? 'Horas' : 'KM';
        
        // Alerta preventiva al aproximarse a los 10,000 (ej: cada múltiplo superior a 8500)
        if (actual > 0 && actual % 10000 >= 8500) {
          listaAlertas.push(`⚠️ El vehículo ${patente} (${vehiculo.modelo || 'Unidad'}) está próximo a servicio (${actual} ${unidad}).`);
        }
      });
    }
    setAlertas(listaAlertas);
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>Control de Mantenimiento Preventivo y Correctivo</h2>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Monitoreo automático de kilometrajes, horómetros y costos de flota.</p>
      
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

          {/* Sección Inferior: Reporte y Alertas Automáticas */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>Estado de Alertas y Reportes de Flota</h3>
            {alertas.length > 0 ? (
              <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '12px 16px', borderRadius: '6px' }}>
                {alertas.map((alerta, idx) => (
                  <p key={idx} style={{ margin: '4px 0', color: '#b45309', fontSize: '13px', fontWeight: '600' }}>{alerta}</p>
                ))}
              </div>
            ) : (
              <div style={{ background: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '12px 16px', borderRadius: '6px' }}>
                <p style={{ margin: 0, color: '#15803d', fontSize: '13px', fontWeight: '600' }}>✅ Toda la flota se encuentra en óptimas condiciones de mantenimiento.</p>
              </div>
            )}
          </div>

          {/* Historial de Mantenimiento / Auditoría */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>📋 Historial de Mantenimientos (Auditoría de Costos)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px' }}>Patente</th>
                  <th style={{ padding: '10px' }}>Tipo</th>
                  <th style={{ padding: '10px' }}>Descripción</th>
                  <th style={{ padding: '10px' }}>Lectura</th>
                  <th style={{ padding: '10px' }}>Costo ($)</th>
                </tr>
              </thead>
              <tbody>
                {!Array.isArray(historial) || historial.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>No hay registros de mantenimientos almacenados aún.</td></tr>
                ) : (
                  historial.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{m.patente}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: m.tipo_mantenimiento === 'Preventivo' ? '#dcfce7' : '#fee2e2', color: m.tipo_mantenimiento === 'Preventivo' ? '#15803d' : '#b91c1c', fontWeight: 'bold', fontSize: '11px' }}>
                          {m.tipo_mantenimiento}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>{m.descripcion_trabajo || '-'}</td>
                      <td style={{ padding: '10px' }}>{m.km_o_horas_actual || 0}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#b45309' }}>${Number(m.costo || 0).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}