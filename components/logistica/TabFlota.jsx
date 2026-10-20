'use client';
import React from 'react';

export default function TabFlota({
  personalEmpresa = [],
  flotaVehiculos = [],
  nuevoNombrePersonal, setNuevoNombrePersonal,
  nuevoRolPersonal, setNuevoRolPersonal,
  nuevoEmailPersonal, setNuevoEmailPersonal,
  nuevoTelPersonal, setNuevoTelPersonal,
  agregarPersonal, eliminarPersonal,
  nuevoDominioVehiculo, setNuevoDominioVehiculo,
  nuevoModeloVehiculo, setNuevoModeloVehiculo,
  nuevoKmVehiculo, setNuevoKmVehiculo,
  tipoMedicionVehiculo, setTipoMedicionVehiculo,
  agregarVehiculo, eliminarVehiculo
}) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}>
      
      <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
        🏢 Administración de Flota y Personal[cite: 9]
      </h3>

      {/* FORMULARIOS SUPERIORES EN DOS COLUMNAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Columna 1: Registrar Nuevo Personal */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#064e3b', fontSize: '16px', fontWeight: 'bold' }}>
            ➕ Registrar Nuevo Personal[cite: 9]
          </h4>
          <form onSubmit={agregarPersonal}>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                Nombre y Apellido:[cite: 9]
              </label>
              <input 
                type="text" 
                placeholder="Ej: Marcos Ruiz"[cite: 9]
                value={nuevoNombrePersonal} 
                onChange={(e) => setNuevoNombrePersonal(e.target.value)} 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required 
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                Rol:[cite: 9]
              </label>
              <select 
                value={nuevoRolPersonal} 
                onChange={(e) => setNuevoRolPersonal(e.target.value)} 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px' }}
              >
                <option value="Chofer">Chofer</option>[cite: 9]
                <option value="Ayudante">Ayudante</option>
                <option value="Encargado de Depósito">Encargado de Depósito</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                Correo:[cite: 9]
              </label>
              <input 
                type="email" 
                placeholder="correo@dmmaestro.com"[cite: 9]
                value={nuevoEmailPersonal} 
                onChange={(e) => setNuevoEmailPersonal(e.target.value)} 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                Teléfono:[cite: 9]
              </label>
              <input 
                type="text" 
                placeholder="387..."[cite: 9]
                value={nuevoTelPersonal} 
                onChange={(e) => setNuevoTelPersonal(e.target.value)} 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '11px', backgroundColor: '#047857', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Guardar Personal[cite: 9]
            </button>
          </form>
        </div>

        {/* Columna 2: Registrar Vehículo / Autoelevador */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#0369a1', fontSize: '16px', fontWeight: 'bold' }}>
            🚚 Registrar Vehículo / Autoelevador[cite: 9]
          </h4>
          <form onSubmit={agregarVehiculo}>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                Patente / Dominio / ID:[cite: 9]
              </label>
              <input 
                type="text" 
                placeholder="EJ: NEB732 O AUTOELEV-01"[cite: 9]
                value={nuevoDominioVehiculo} 
                onChange={(e) => setNuevoDominioVehiculo(e.target.value)} 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'uppercase', fontSize: '13px' }}
                required 
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                Modelo:[cite: 9]
              </label>
              <input 
                type="text" 
                placeholder="Ej: IVECO Daily o Toyota 2.5T"[cite: 9]
                value={nuevoModeloVehiculo} 
                onChange={(e) => setNuevoModeloVehiculo(e.target.value)} 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required 
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                Medición de Uso / Mantenimiento:[cite: 9]
              </label>
              <select 
                value={tipoMedicionVehiculo} 
                onChange={(e) => setTipoMedicionVehiculo(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px' }}
              >
                <option value="Kilómetros">Kilómetros (Camiones / Furgones)</option>[cite: 9]
                <option value="Horas">Horas de Trabajo (Autoelevadores)</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                Kilometraje Actual:[cite: 9]
              </label>
              <input 
                type="number" 
                placeholder="124500"[cite: 9]
                value={nuevoKmVehiculo} 
                onChange={(e) => setNuevoKmVehiculo(e.target.value)} 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                required
              />
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '11px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Guardar Vehículo / Unidad[cite: 9]
            </button>
          </form>
        </div>

      </div>

      {/* SECCIÓN DE TABLAS INFERIORES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>
            👥 Plantel Registrado[cite: 9]
          </h4>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                  <th style={{ padding: '10px' }}>Nombre</th>
                  <th style={{ padding: '10px' }}>Rol</th>
                  <th style={{ padding: '10px' }}>Teléfono</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {personalEmpresa.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>Sin personal registrado.</td>
                  </tr>
                ) : (
                  personalEmpresa.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.nombre}</td>
                      <td style={{ padding: '10px' }}>{p.rol}</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{p.telefono}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button 
                          onClick={() => eliminarPersonal(p.id)} 
                          style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>
            🚛 Vehículos y Autoelevadores Activos[cite: 9]
          </h4>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                  <th style={{ padding: '10px' }}>Patente</th>
                  <th style={{ padding: '10px' }}>Modelo</th>
                  <th style={{ padding: '10px' }}>Kilometraje</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {flotaVehiculos.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>Sin vehículos registrados.</td>
                  </tr>
                ) : (
                  flotaVehiculos.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>{v.dominio}</td>
                      <td style={{ padding: '10px' }}>{v.modelo}</td>
                      <td style={{ padding: '10px', color: '#0284c7', fontWeight: 'bold' }}>{v.km} KM</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button 
                          onClick={() => eliminarVehiculo(v.dominio)} 
                          style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}