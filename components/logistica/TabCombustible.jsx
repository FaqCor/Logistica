import React, { useState, useEffect } from 'react';

export default function TabCombustible({ vehiculos = [], onRegistrarCarga }) {
  // Lista fallback por si no pasan datos de vehículos desde el estado global/Neon DB
  const vehiculosLista = vehiculos.length > 0 ? vehiculos : [
    { id: 1, patente: 'AA-123-BC', modelo: 'Mercedes-Benz Accelo 1016', kmAnterior: 118400, kmActual: 120500, totalLitros: 420 },
    { id: 2, patente: 'AB-987-XY', modelo: 'Ford Cargo 1722', kmAnterior: 205100, kmActual: 208300, totalLitros: 890 },
    { id: 3, patente: 'AF-456-ZZ', modelo: 'Scania R450', kmAnterior: 84200, kmActual: 86900, totalLitros: 1150 },
    { id: 4, patente: 'AD-321-LK', modelo: 'Iveco Tector 170E28', kmAnterior: 154000, kmActual: 155800, totalLitros: 610 }
  ];

  // Estado del formulario
  const [selectedVehiculoId, setSelectedVehiculoId] = useState('');
  const [litros, setLitros] = useState('');
  const [costoTotal, setCostoTotal] = useState('');
  const [estacion, setEstacion] = useState('YPF');
  const [remito, setRemito] = useState('');
  const [historialCargas, setHistorialCargas] = useState([
    { id: 101, fecha: '2026-10-20', patente: 'AA-123-BC', kmMomento: 120500, litros: 85, costo: 110500, estacion: 'YPF' },
    { id: 102, fecha: '2026-10-19', patente: 'AB-987-XY', kmMomento: 208300, litros: 150, costo: 195000, estacion: 'Shell' },
    { id: 103, fecha: '2026-10-18', patente: 'Scania R450', patenteText: 'AF-456-ZZ', kmMomento: 86900, litros: 210, costo: 273000, estacion: 'Puma' }
  ]);

  // Obtener vehículo seleccionado dinámicamente
  const vehiculoSeleccionado = vehiculosLista.find(
    (v) => String(v.id) === String(selectedVehiculoId) || v.patente === selectedVehiculoId
  );

  const handleAgregarCarga = (e) => {
    e.preventDefault();
    if (!vehiculoSeleccionado || !litros || Number(litros) <= 0) {
      alert('Por favor selecciona un vehículo y carga la cantidad de litros consumidos.');
      return;
    }

    const nuevaCarga = {
      id: Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      patente: vehiculoSeleccionado.patente,
      kmMomento: vehiculoSeleccionado.kmActual,
      litros: parseFloat(litros),
      costo: costoTotal ? parseFloat(costoTotal) : 0,
      estacion,
      remito
    };

    setHistorialCargas([nuevaCarga, ...historialCargas]);

    // Disparar callback si el componente padre actualiza la base de datos Neon
    if (onRegistrarCarga) {
      onRegistrarCarga(vehiculoSeleccionado.id, parseFloat(litros));
    }

    // Limpiar formulario
    setLitros('');
    setCostoTotal('');
    setRemito('');
    alert('Carga de combustible registrada exitosamente.');
  };

  // Cálculo para reporte consolidado por vehículo
  const resumenCombustible = vehiculosLista.map((v) => {
    const cargasVehiculo = historialCargas.filter((c) => c.patente === v.patente);
    const litrosHistorial = cargasVehiculo.reduce((acc, curr) => acc + Number(curr.litros), 0);
    const totalLitrosAcum = (v.totalLitros || 0) + litrosHistorial;
    const kmRecorridos = (v.kmActual || 0) - (v.kmAnterior || 0);
    const rendimiento = totalLitrosAcum > 0 ? (kmRecorridos / totalLitrosAcum).toFixed(2) : '0.00';

    return {
      id: v.id,
      patente: v.patente,
      modelo: v.modelo || 'S/D',
      kmAnterior: v.kmAnterior || 0,
      kmActual: v.kmActual || 0,
      kmRecorridos: kmRecorridos > 0 ? kmRecorridos : 0,
      litrosTotales: totalLitrosAcum,
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
            Módulo vinculado con base de datos Neon para control de consumo y rendimiento de flota.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* FORMULARIO DE CARGA DE COMBUSTIBLE */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            📝 Cargar Consumo
          </h3>
          
          <form onSubmit={handleAgregarCarga} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* DESPLEGABLE DE VEHÍCULOS */}
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
                {vehiculosLista.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.patente} - {v.modelo || 'Transporte'}
                  </option>
                ))}
              </select>
            </div>

            {/* INGRESAR LITROS */}
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

            {/* ESTACIÓN Y REMITO */}
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
                cursor: 'pointer',
                transition: 'background-color 0.2s'
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
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{vehiculoSeleccionado.patente}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Modelo / Descripción:</span>
                <strong style={{ color: '#334155', fontSize: '0.95rem' }}>{vehiculoSeleccionado.modelo || 'N/A'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>KM Anterior registrado:</span>
                <strong style={{ color: '#d97706', fontSize: '0.95rem' }}>{(vehiculoSeleccionado.kmAnterior || 0).toLocaleString()} km</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>KM Actual en odómetro:</span>
                <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>{(vehiculoSeleccionado.kmActual || 0).toLocaleString()} km</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', backgroundColor: '#f1f5f9', padding: '0.6rem', borderRadius: '6px' }}>
                <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>Litros Acumulados Cargados:</span>
                <strong style={{ color: '#059669', fontSize: '1rem' }}>
                  {(
                    (vehiculoSeleccionado.totalLitros || 0) +
                    historialCargas
                      .filter((c) => c.patente === vehiculoSeleccionado.patente)
                      .reduce((a, b) => a + Number(b.litros), 0)
                  ).toFixed(1)}{' '}
                  L
                </strong>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
              👈 Selecciona un vehículo del menú desplegable para consultar sus métricas de odómetro y combustible.
            </div>
          )}
        </div>
      </div>

      {/* REPORTE INFERIOR: CANTIDAD DE COMBUSTIBLE CONSUMIDO POR CADA TRANSPORTE */}
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
                <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
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