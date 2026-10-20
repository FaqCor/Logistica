'use client';
import React from 'react';

export default function TabFlota({
  personalEmpresa = [], flotaVehiculos = [],
  nuevoNombrePersonal, setNuevoNombrePersonal,
  nuevoRolPersonal, setNuevoRolPersonal,
  nuevoEmailPersonal, setNuevoEmailPersonal,
  nuevoTelPersonal, setNuevoTelPersonal,
  agregarPersonal, eliminarPersonal,
  nuevoDominioVehiculo, setNuevoDominioVehiculo,
  nuevoModeloVehiculo, setNuevoModeloVehiculo,
  nuevoKmVehiculo, setNuevoKmVehiculo,
  agregarVehiculo, eliminarVehiculo
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
        <h3>👥 Registro de Personal</h3>
        <form onSubmit={agregarPersonal} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '15px' }}>
          <input type="text" placeholder="Nombre completo" value={nuevoNombrePersonal} onChange={(e) => setNuevoNombrePersonal(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
          <select value={nuevoRolPersonal} onChange={(e) => setNuevoRolPersonal(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
            <option value="Chofer">Chofer</option>
            <option value="Ayudante">Ayudante</option>
          </select>
          <input type="email" placeholder="Correo" value={nuevoEmailPersonal} onChange={(e) => setNuevoEmailPersonal(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          <input type="tel" placeholder="Teléfono" value={nuevoTelPersonal} onChange={(e) => setNuevoTelPersonal(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          <button type="submit" style={{ background: '#047857', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Agregar</button>
        </form>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Nombre</th>
              <th style={{ padding: '8px' }}>Rol</th>
              <th style={{ padding: '8px' }}>Teléfono</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {personalEmpresa.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.nombre}</td>
                <td style={{ padding: '8px' }}>{p.rol}</td>
                <td style={{ padding: '8px' }}>{p.telefono}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}><button onClick={() => eliminarPersonal(p.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
        <h3>🚚 Control de Flota</h3>
        <form onSubmit={agregarVehiculo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '15px' }}>
          <input type="text" placeholder="Patente" value={nuevoDominioVehiculo} onChange={(e) => setNuevoDominioVehiculo(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
          <input type="text" placeholder="Modelo" value={nuevoModeloVehiculo} onChange={(e) => setNuevoModeloVehiculo(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
          <input type="number" placeholder="KM Actual" value={nuevoKmVehiculo} onChange={(e) => setNuevoKmVehiculo(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
          <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Registrar</button>
        </form>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Patente</th>
              <th style={{ padding: '8px' }}>Modelo</th>
              <th style={{ padding: '8px' }}>KM</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {flotaVehiculos.map((v, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{v.dominio}</td>
                <td style={{ padding: '8px' }}>{v.modelo}</td>
                <td style={{ padding: '8px' }}>{v.km} KM</td>
                <td style={{ padding: '8px', textAlign: 'right' }}><button onClick={() => eliminarVehiculo(v.dominio)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}