'use client';
import React, { useState, useEffect, useRef } from 'react';

export default function TabCombustible({ vehiculos = [] }) {
  const [vehiculosLista, setVehiculosLista] = useState(vehiculos);
  const [historialCargas, setHistorialCargas] = useState([]);
  const [selectedVehiculoId, setSelectedVehiculoId] = useState('');
  const [litros, setLitros] = useState('');
  const [costoTotal, setCostoTotal] = useState('');
  const [estacion, setEstacion] = useState('YPF');
  const [remito, setRemito] = useState('');
  const [cargando, setCargando] = useState(true);

  // Referencia para persistencia de respaldo ante cierre de pestaña o sesión
  const formValuesRef = useRef({ selectedVehiculoId, litros, costoTotal, estacion, remito, vehiculosLista });
  useEffect(() => {
    formValuesRef.current = { selectedVehiculoId, litros, costoTotal, estacion, remito, vehiculosLista };
  }, [selectedVehiculoId, litros, costoTotal, estacion, remito, vehiculosLista]);

  useEffect(() => {
    cargarDatosNeon();

    const handleBeforeUnload = () => {
      const current = formValuesRef.current;
      if (current.selectedVehiculoId && current.litros) {
        const vehiculo = current.vehiculosLista.find(
          v => String(v.id) === String(current.selectedVehiculoId) || v.patente === current.selectedVehiculoId || v.dominio === current.selectedVehiculoId
        );
        const patenteUnidad = vehiculo ? (vehiculo.dominio || vehiculo.patente) : current.selectedVehiculoId;
        
        const data = JSON.stringify({
          patente: patenteUnidad,
          litros: parseFloat(current.litros) || 0,
          costo: parseFloat(current.costoTotal) || 0,
          estacion: current.estacion,
          remito: current.remito || 'Cierre automático',
          km_momento: vehiculo ? (vehiculo.km || vehiculo.km_actual || 0) : 0
        });
        navigator.sendBeacon('/api/combustible', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const cargarDatosNeon = async () => {
    try {
      setCargando(true);
      // Obtener flota desde la base de datos si no viene por props
      if (vehiculos.length === 0) {
        const resFlota = await fetch('/api/flota', { cache: 'no-store' });
        if (resFlota.ok) {
          const dataFlota = await resFlota.json();
          setVehiculosLista(Array.isArray(dataFlota) ? dataFlota : (dataFlota.flota || []));
        }
      } else {
        setVehiculosLista(vehiculos);
      }

      // Obtener historial de combustible persistido en Neon
      const resComb = await fetch('/api/combustible', { cache: 'no-store' });
      if (resComb.ok) {
        const dataComb = await resComb.json();
        setHistorialCargas(Array.isArray(dataComb) ? dataComb : (dataComb.combustible || []));
      }
    } catch (error) {
      console.warn("Error al sincronizar con Neon:", error);
    } finally {
      setCargando(false);
    }
  };

  const vehiculoSeleccionado = vehiculosLista.find(
    (v) => String(v.id) === String(selectedVehiculoId) || v.patente === selectedVehiculoId || v.dominio === selectedVehiculoId
  );

  const handleAgregarCarga = async (e) => {
    e.preventDefault();
    if (!vehiculoSeleccionado || !litros || Number(litros) <= 0) {
      alert('Por favor selecciona un vehículo válido y carga la cantidad de litros consumidos.');
      return;
    }

    const patenteUnidad = vehiculoSeleccionado.dominio || vehiculoSeleccionado.patente;

    const nuevaCarga = {
      patente: patenteUnidad,
      km_momento: vehiculoSeleccionado.km || vehiculoSeleccionado.km_actual || 0,
      litros: parseFloat(litros),
      costo: costoTotal ? parseFloat(costoTotal) : 0,
      estacion,
      remito,
      fecha: new Date().toLocaleDateString()
    };

    try {
      const res = await fetch('/api/combustible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaCarga)
      });

      if (res.ok) {
        const dataRes = await res.json();
        setHistorialCargas([dataRes.data || nuevaCarga, ...historialCargas]);
        alert(`Carga de ${litros} litros guardada exitosamente en Neon para el vehículo ${patenteUnidad}.`);
      } else {
        throw new Error("Error en la API");
      }
    } catch (error) {
      console.warn("Guardado local por fallo de red:", error);
      setHistorialCargas([nuevaCarga, ...historialCargas]);
    }

    setLitros('');
    setCostoTotal('');
    setRemito('');
    setSelectedVehiculoId('');
  };

  // Cálculo de resumen totalmente aislado por patente estricta
  const resumenCombustible = vehiculosLista.map((v) => {
    const patenteUnidad = v.dominio || v.patente;
    const cargasVehiculo = historialCargas.filter((c) => c.patente === patenteUnidad);
    const litrosHistorial = cargasVehiculo.reduce((acc, curr) => acc + Number(curr.litros || curr.litros_consumidos || 0), 0);
    
    const kmAnt = v.kmAnterior || v.km_anterior || 0;
    const kmAct = v.km || v.km_actual || 0;
    const kmRecorridos = kmAct - kmAnt;
    const rendimiento = litrosHistorial > 0 ? (kmRecorridos / litrosHistorial).toFixed(2) : '0.00';

    return {
      id: v.id || patenteUnidad,
      patente: patenteUnidad,
      modelo: v.modelo || 'S/D',
      kmAnterior: kmAnt,
      kmActual: kmAct,
      kmRecorridos: kmRecorridos > 0 ? kmRecorridos : 0,
      litrosTotales: litrosHistorial,
      rendimiento
    };
  });

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', minHeight: '80vh' }}>
      
      {/* HEADER TÍTULO */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.8rem' }}>⛽</span>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            Registro y Control de Combustible
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Vinculado a base de datos Neon (Aislamiento por patente y persistencia activa).
          </p>
        </div>
      </div>

      {cargando ? (
        <p style={{ color: '#64748b' }}>Cargando información de flota y combustible desde Neon...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* FORMULARIO DE CARGA */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              📝 Cargar Consumo
            </h3>
            
            <form onSubmit={handleAgregarCarga} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                  Seleccionar Vehículo / Transporte *
                </label>
                <select
                  value={selectedVehiculoId}
                  onChange={(e) => setSelectedVehiculoId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  required
                >
                  <option value="">-- Seleccionar Transporte --</option>
                  {vehiculosLista.map((v, index) => {
                    const pat = v.dominio || v.patente;
                    return (
                      <option key={index} value={pat}>
                        {pat} - {v.modelo || 'Transporte'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                    Litros Consumidos *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 85.5"
                    value={litros}
                    onChange={(e) => setLitros(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                    Costo Total ($)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 110000"
                    value={costoTotal}
                    onChange={(e) => setCostoTotal(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                    Estación
                  </label>
                  <select
                    value={estacion}
                    onChange={(e) => setEstacion(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="YPF">YPF</option>
                    <option value="Shell">Shell</option>
                    <option value="Puma">Puma</option>
                    <option value="Axion">Axion</option>
                    <option value="Tanque Propio">Tanque Propio</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                    Nº Remito / Ticket
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 0001-00045"
                    value={remito}
                    onChange={(e) => setRemito(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  backgroundColor: '#0f766e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Registrar Carga de Combustible
              </button>
            </form>
          </div>

          {/* TARJETA CON INFORMACIÓN DEL VEHÍCULO SELECCIONADO */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              📊 Datos del Vehículo Seleccionado
            </h3>

            {vehiculoSeleccionado ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Patente / Unidad:</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{vehiculoSeleccionado.dominio || vehiculoSeleccionado.patente}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Modelo / Descripción:</span>
                  <strong style={{ color: '#334155', fontSize: '0.95rem' }}>{vehiculoSeleccionado.modelo || 'N/A'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', backgroundColor: '#f1f5f9', padding: '0.6rem', borderRadius: '6px' }}>
                  <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>Litros Acumulados:</span>
                  <strong style={{ color: '#059669', fontSize: '1rem' }}>
                    {(
                      historialCargas
                        .filter((c) => c.patente === (vehiculoSeleccionado.dominio || vehiculoSeleccionado.patente))
                        .reduce((a, b) => a + Number(b.litros || b.litros_consumidos || 0), 0)
                    ).toFixed(1)}{' '}
                    L
                  </strong>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
                👈 Selecciona un vehículo para ver sus litros y métricas acumuladas en Neon.
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORTE CONSOLIDADO */}
      <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
          📈 Reporte Consolidado de Consumo por Transporte
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Patente</th>
                <th style={{ padding: '0.75rem 1rem' }}>Modelo / Vehículo</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>KM Anterior</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>KM Actual</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Recorrido</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', backgroundColor: '#065f46' }}>Litros Consumidos</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Rendimiento Estimado</th>
              </tr>
            </thead>
            <tbody>
              {resumenCombustible.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#0f172a' }}>{row.patente}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{row.modelo}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#64748b' }}>{row.kmAnterior.toLocaleString()} km</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#64748b' }}>{row.kmActual.toLocaleString()} km</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: '#2563eb' }}>{row.kmRecorridos.toLocaleString()} km</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold', color: '#047857', backgroundColor: '#ecfdf5' }}>
                    {row.litrosTotales.toFixed(1)} L
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                      {row.rendimiento} km/L
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}