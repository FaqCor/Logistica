'use client';
import React from 'react';

export default function TabFlota({
  personalEmpresa = [],
  flotaVehiculos = [],
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      {/* SECCIÓN PERSONAL */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>👥 Registro de Choferes y Personal</h3>
        <form onSubmit={agregarPersonal} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <input type="text" placeholder="Nombre completo" value={nuevoNombrePersonal} onChange={(e) => setNuevoNombrePersonal(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          <select value={nuevoRolPersonal} onChange={(e) => setNuevoRolPersonal(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="Chofer">Chofer</option>
            <option value="Encargado de Depósito">Encargado de Depósito</option>
            <option value="Administrador">Administrador</option>
          </select>
          <input type="email" placeholder="Correo electrónico" value={nuevoEmailPersonal} onChange={(e) => setNuevoEmailPersonal(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          <input type="tel" placeholder="Teléfono / WhatsApp" value={nuevoTelPersonal} onChange={(e) => setNuevoTelPersonal(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          <button type="submit" style={{ backgroundColor: '#047857', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 16px' }}>➕ Agregar Personal</button>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Nombre</th>
                <th style={{ padding: '10px' }}>Rol</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Teléfono</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personalEmpresa.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.nombre}</td>
                  <td style={{ padding: '10px' }}>{p.rol}</td>
                  <td style={{ padding: '10px' }}>{p.email || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>{p.telefono || 'N/A'}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <button onClick={() => eliminarPersonal(p.id)} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN FLOTA */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>🚚 Control de Flota de Vehículos</h3>
        <form onSubmit={agregarVehiculo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <input type="text" placeholder="Patente / Dominio" value={nuevoDominioVehiculo} onChange={(e) => setNuevoDominioVehiculo(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          <input type="text" placeholder="Modelo / Marca" value={nuevoModeloVehiculo} onChange={(e) => setNuevoModeloVehiculo(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          <input type="number" placeholder="KM Actual" value={nuevoKmVehiculo} onChange={(e) => setNuevoKmVehiculo(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 16px' }}>➕ Registrar Vehículo</button>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Patente</th>
                <th style={{ padding: '10px' }}>Modelo</th>
                <th style={{ padding: '10px' }}>KM Odómetro</th>
                <th style={{ padding: '10px' }}>Estado</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {flotaVehiculos.map((v, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{v.dominio}</td>
                  <td style={{ padding: '10px' }}>{v.modelo}</td>
                  <td style={{ padding: '10px' }}>{v.km} KM</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ backgroundColor: v.estado === 'En Viaje' ? '#fef3c7' : '#dcfce7', color: v.estado === 'En Viaje' ? '#b45309' : '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                      {v.estado}
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <button onClick={() => eliminarVehiculo(v.dominio)} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Eliminar</button>
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