'use client';
import React, { useState, useEffect } from 'react';

export default function TabCarnetsChoferes() {
  const [choferes, setChoferes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoDni, setEditandoDni] = useState(null);
  
  // Estado temporal para el formulario de edición
  const [formData, setFormData] = useState({
    vencimiento_licencia: '',
    vencimiento_cargas_peligrosas: '',
    vencimiento_cargas_generales: '',
    vencimiento_psicofisico: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const res = await fetch('/api/carnets-choferes', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Unificar choferes base con sus carnets cargados
        const mapaCarnets = {};
        (data.carnetsGuardados || []).forEach(c => {
          mapaCarnets[c.dni] = c;
        });

        const listaCombinada = (data.choferesBase || []).map(ch => ({
          dni: ch.dni,
          nombre: ch.nombre,
          vencimiento_licencia: mapaCarnets[ch.dni]?.vencimiento_licencia || '',
          vencimiento_cargas_peligrosas: mapaCarnets[ch.dni]?.vencimiento_cargas_peligrosas || '',
          vencimiento_cargas_generales: mapaCarnets[ch.dni]?.vencimiento_cargas_generales || '',
          vencimiento_psicofisico: mapaCarnets[ch.dni]?.vencimiento_psicofisico || ''
        }));

        setChoferes(listaCombinada);
      }
    } catch (error) {
      console.error("Error al cargar carnets de choferes:", error);
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicion = (chofer) => {
    setEditandoDni(chofer.dni);
    setFormData({
      vencimiento_licencia: chofer.vencimiento_licencia,
      vencimiento_cargas_peligrosas: chofer.vencimiento_cargas_peligrosas,
      vencimiento_cargas_generales: chofer.vencimiento_cargas_generales,
      vencimiento_psicofisico: chofer.vencimiento_psicofisico
    });
  };

  const guardarCambios = async (chofer) => {
    try {
      const payload = {
        dni: chofer.dni,
        nombre: chofer.nombre,
        ...formData
      };

      const res = await fetch('/api/carnets-choferes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`Documentación de ${chofer.nombre} actualizada correctamente.`);
        setEditandoDni(null);
        cargarDatos();
      } else {
        alert('Error al guardar en la base de datos.');
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', minHeight: '80vh' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.8rem' }}>🪪</span>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            Carnets y Documentación de Choferes
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Control de licencias, cargas peligrosas, generales y psicofísicos sincronizado con Neon.
          </p>
        </div>
      </div>

      {cargando ? (
        <p style={{ color: '#64748b' }}>Cargando choferes y licencias...</p>
      ) : (
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                <th style={{ padding: '0.75rem 1rem' }}>DNI</th>
                <th style={{ padding: '0.75rem 1rem' }}>Nombre y Apellido</th>
                <th style={{ padding: '0.75rem 1rem' }}>Licencia Conducir</th>
                <th style={{ padding: '0.75rem 1rem' }}>Cargas Peligrosas</th>
                <th style={{ padding: '0.75rem 1rem' }}>Cargas Generales</th>
                <th style={{ padding: '0.75rem 1rem' }}>Examen Psicofísico</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {choferes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No hay choferes registrados en el sistema. Agregalos desde el módulo de Personal o Choferes.
                  </td>
                </tr>
              ) : (
                choferes.map((ch, idx) => {
                  const esEditando = editandoDni === ch.dni;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#0f172a' }}>{ch.dni}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{ch.nombre}</td>
                      
                      {/* VENCIMIENTO LICENCIA */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {esEditando ? (
                          <input type="date" value={formData.vencimiento_licencia} onChange={e => setFormData({...formData, vencimiento_licencia: e.target.value})} style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        ) : (
                          <span style={{ color: ch.vencimiento_licencia ? '#0f172a' : '#94a3b8' }}>{ch.vencimiento_licencia || 'Sin registrar'}</span>
                        )}
                      </td>

                      {/* CARGAS PELIGROSAS */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {esEditando ? (
                          <input type="date" value={formData.vencimiento_cargas_peligrosas} onChange={e => setFormData({...formData, vencimiento_cargas_peligrosas: e.target.value})} style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        ) : (
                          <span style={{ color: ch.vencimiento_cargas_peligrosas ? '#0f172a' : '#94a3b8' }}>{ch.vencimiento_cargas_peligrosas || 'Sin registrar'}</span>
                        )}
                      </td>

                      {/* CARGAS GENERALES */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {esEditando ? (
                          <input type="date" value={formData.vencimiento_cargas_generales} onChange={e => setFormData({...formData, vencimiento_cargas_generales: e.target.value})} style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        ) : (
                          <span style={{ color: ch.vencimiento_cargas_generales ? '#0f172a' : '#94a3b8' }}>{ch.vencimiento_cargas_generales || 'Sin registrar'}</span>
                        )}
                      </td>

                      {/* PSICOFÍSICO */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {esEditando ? (
                          <input type="date" value={formData.vencimiento_psicofisico} onChange={e => setFormData({...formData, vencimiento_psicofisico: e.target.value})} style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        ) : (
                          <span style={{ color: ch.vencimiento_psicofisico ? '#0f172a' : '#94a3b8' }}>{ch.vencimiento_psicofisico || 'Sin registrar'}</span>
                        )}
                      </td>

                      {/* ACCIONES */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {esEditando ? (
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button onClick={() => guardarCambios(ch)} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '0.4rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Guardar</button>
                            <button onClick={() => setEditandoDni(null)} style={{ backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '0.4rem 0.7rem', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                          </div>
                        ) : (
                          <button onClick={() => iniciarEdicion(ch)} style={{ backgroundColor: '#0f766e', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Editar</button>
                        )}
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
  );
}