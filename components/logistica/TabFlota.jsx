'use client';
import React from 'react';

export default function TabFlota({
  personalEmpresa,
  flotaVehiculos,
  nuevoNombrePersonal,
  setNuevoNombrePersonal,
  nuevoRolPersonal,
  setNuevoRolPersonal,
  nuevoEmailPersonal,
  setNuevoEmailPersonal,
  nuevoTelPersonal,
  setNuevoTelPersonal,
  agregarPersonal,
  eliminarPersonal,
  nuevoDominioVehiculo,
  setNuevoDominioVehiculo,
  nuevoModeloVehiculo,
  setNuevoModeloVehiculo,
  nuevoKmVehiculo,
  setNuevoKmVehiculo,
  tipoMedicionVehiculo,
  setTipoMedicionVehiculo,
  nuevasHorasVehiculo,
  setNuevasHorasVehiculo,
  agregarVehiculo,
  eliminarVehiculo
}) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>🏢 Administración de Flota y Personal</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#064e3b', fontSize: '16px' }}>➕ Registrar Nuevo Personal</h4>
          <form onSubmit={agregarPersonal}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Nombre y Apellido:</label>
              <input type="text" placeholder="Ej: Marcos Ruiz" value={nuevoNombrePersonal} onChange={(e) => setNuevoNombrePersonal(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Rol:</label>
              <select value={nuevoRolPersonal} onChange={(e) => setNuevoRolPersonal(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                <option value="Chofer">Chofer</option>
                <option value="Ayudante">Ayudante</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Correo:</label>
              <input type="email" placeholder="correo@dmmaestro.com" value={nuevoEmailPersonal} onChange={(e) => setNuevoEmailPersonal(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Teléfono:</label>
              <input type="text" placeholder="387..." value={nuevoTelPersonal} onChange={(e) => setNuevoTelPersonal(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#047857', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Personal</button>
          </form>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#064e3b', fontSize: '16px' }}>🚛 Registrar Vehículo / Autoelevador</h4>
          <form onSubmit={agregarVehiculo}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Patente / Dominio / ID:</label>
              <input type="text" placeholder="Ej: NEB732" value={nuevoDominioVehiculo} onChange={(e) => setNuevoDominioVehiculo(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'uppercase' }} required />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Modelo:</label>
              <input type="text" placeholder="Ej: IVECO Daily" value={nuevoModeloVehiculo} onChange={(e) => setNuevoModeloVehiculo(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Medición de Uso / Mantenimiento:</label>
              <select value={tipoMedicionVehiculo} onChange={(e) => setTipoMedicionVehiculo(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                <option value="Kilómetros">Kilómetros (Camiones / Furgones)</option>
                <option value="Horas">Horas de Trabajo - Horómetro (Autoelevadores)</option>
              </select>
            </div>
            {tipoMedicionVehiculo === 'Kilómetros' ? (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Kilometraje Actual:</label>
                <input type="number" placeholder="124500" value={nuevoKmVehiculo} onChange={(e) => setNuevoKmVehiculo(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
            ) : (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#b45309' }}>⚙️ Horas de Trabajo Actuales (Horómetro):</label>
                <input type="number" placeholder="Ej: 1250" value={nuevasHorasVehiculo} onChange={(e) => setNuevasHorasVehiculo(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #f59e0b', backgroundColor: '#fffbeb' }} required />
              </div>
            )}
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Vehículo / Unidad</button>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>👥 Plantel Registrado</h4>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px' }}>Nombre</th>
                  <th style={{ padding: '8px' }}>Rol</th>
                  <th style={{ padding: '8px' }}>Contacto</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {personalEmpresa.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.nombre}</td>
                    <td style={{ padding: '8px' }}><span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: p.rol === 'Chofer' ? '#dcfce7' : '#e0f2fe', color: p.rol === 'Chofer' ? '#166534' : '#0369a1' }}>{p.rol}</span></td>
                    <td style={{ padding: '8px', color: '#64748b' }}>{p.telefono}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}><button onClick={() => eliminarPersonal(p.id)} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>🚛 Vehículos y Autoelevadores Activos</h4>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px' }}>Patente/ID</th>
                  <th style={{ padding: '8px' }}>Modelo</th>
                  <th style={{ padding: '8px' }}>Uso Actual</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {flotaVehiculos.map((v, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold', fontFamily: 'monospace' }}>{v.dominio}</td>
                    <td style={{ padding: '8px' }}>{v.modelo}</td>
                    <td style={{ padding: '8px', color: v.tipoMedicion === 'Horas' ? '#b45309' : '#0284c7', fontWeight: 'bold' }}>{v.tipoMedicion === 'Horas' ? `⚙️ ${v.horas} Horas` : `🛣️ ${v.km} km`}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}><button onClick={() => eliminarVehiculo(v.dominio)} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}