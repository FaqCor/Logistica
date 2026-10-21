'use client';
import React, { useState, useEffect } from 'react';

export default function TabCarnetsChoferes() {
  const [personalLista, setPersonalLista] = useState([]);
  const [carnetsGuardados, setCarnetsGuardados] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [choferSeleccionado, setChoferSeleccionado] = useState('');
  const [vencLicencia, setVencLicencia] = useState('');
  const [vencPeligrosas, setVencPeligrosas] = useState('');
  const [vencGenerales, setVencGenerales] = useState('');
  const [vencPsicofisico, setVencPsicofisico] = useState('');

  const [editandoNombre, setEditandoNombre] = useState(null);
  const [formEdit, setFormEdit] = useState({});

  useEffect(() => {
    cargarDatosNeon();
  }, []);

  const cargarDatosNeon = async () => {
    try {
      setCargando(true);
      const res = await fetch('/api/carnets-choferes', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPersonalLista(data.personalBase || []);
        setCarnetsGuardados(data.carnetsGuardados || []);
      }
    } catch (error) {
      console.error("Error al conectar con Neon:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarCarnet = async (e) => {
    e.preventDefault();
    if (!choferSeleccionado) {
      alert('Por favor selecciona un chofer o ayudante.');
      return;
    }

    const integrante = personalLista.find(p => p.nombre === choferSeleccionado);

    const payload = {
      nombre: choferSeleccionado,
      email: integrante?.email || '',
      vencimiento_licencia: vencLicencia,
      vencimiento_cargas_peligrosas: vencPeligrosas,
      vencimiento_cargas_generales: vencGenerales,
      vencimiento_psicofisico: vencPsicofisico
    };

    try {
      const res = await fetch('/api/carnets-choferes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const dataRes = await res.json();

      if (res.ok && dataRes.success) {
        alert(`Documentación guardada con éxito para ${choferSeleccionado}.`);
        setChoferSeleccionado('');
        setVencLicencia('');
        setVencPeligrosas('');
        setVencGenerales('');
        setVencPsicofisico('');
        cargarDatosNeon();
      } else {
        alert(`Error al guardar en la base de datos: ${dataRes.error || 'Desconocido'}`);
      }
    } catch (err) {
      console.error("Error de red:", err);
      alert('Error de conexión al intentar guardar.');
    }
  };

  const iniciarEdicion = (item) => {
    setEditandoNombre(item.nombre);
    setFormEdit({
      vencimiento_licencia: item.vencimiento_licencia || '',
      vencimiento_cargas_peligrosas: item.vencimiento_cargas_peligrosas || '',
      vencimiento_cargas_generales: item.vencimiento_cargas_generales || '',
      vencimiento_psicofisico: item.vencimiento_psicofisico || ''
    });
  };

  const guardarEdicionRapida = async (nombre) => {
    try {
      const integrante = personalLista.find(p => p.nombre === nombre);
      const payload = {
        nombre,
        email: integrante?.email || '',
        ...formEdit
      };

      const res = await fetch('/api/carnets-choferes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`Documentación de ${nombre} actualizada correctamente.`);
        setEditandoNombre(null);
        cargarDatosNeon();
      } else {
        alert('Error al actualizar los datos.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const mapaCarnets = {};
  carnetsGuardados.forEach(c => { mapaCarnets[c.nombre] = c; });

  const reporteCompleto = personalLista.map(p => ({
    nombre: p.nombre,
    rol: p.rol || 'Chofer',
    email: p.email || '-',
    vencimiento_licencia: mapaCarnets[p.nombre]?.vencimiento_licencia || '',
    vencimiento_cargas_peligrosas: mapaCarnets[p.nombre]?.vencimiento_cargas_peligrosas || '',
    vencimiento_cargas_generales: mapaCarnets[p.nombre]?.vencimiento_cargas_generales || '',
    vencimiento_psicofisico: mapaCarnets[p.nombre]?.vencimiento_psicofisico || ''
  }));

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', minHeight: '80vh' }}>
      
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.8rem' }}>🪪</span>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            Carnets y Documentación de Choferes
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Control de licencias, cargas peligrosas, generales y psicofísicos vinculado con Neon BD.
          </p>
        </div>
      </div>

      {cargando ? (
        <p style={{ color: '#64748b' }}>Sincronizando con base de datos Neon...</p>
      ) : (
        <>
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              📝 Registrar / Actualizar Vencimientos de Personal
            </h3>

            <form onSubmit={handleGuardarCarnet} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                  Seleccionar Chofer / Ayudante *
                </label>
                <select
                  value={choferSeleccionado}
                  onChange={(e) => {
                    const nom = e.target.value;
                    setChoferSeleccionado(nom);
                    const exist = mapaCarnets[nom];
                    if (exist) {
                      setVencLicencia(exist.vencimiento_licencia || '');
                      setVencPeligrosas(exist.vencimiento_cargas_peligrosas || '');
                      setVencGenerales(exist.vencimiento_cargas_generales || '');
                      setVencPsicofisico(exist.vencimiento_psicofisico || '');
                    } else {
                      setVencLicencia('');
                      setVencPeligrosas('');
                      setVencGenerales('');
                      setVencPsicofisico('');
                    }
                  }}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  required
                >
                  <option value="">-- Selecciona un integrante ({personalLista.length} disponibles) --</option>
                  {personalLista.map((p, idx) => (
                    <option key={idx} value={p.nombre}>
                      {p.nombre} ({p.rol || 'Chofer'}) - {p.email || 'Sin correo'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                  Licencia Conducir
                </label>
                <input
                  type="date"
                  value={vencLicencia}
                  onChange={(e) => setVencLicencia(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                  Cargas Peligrosas
                </label>
                <input
                  type="date"
                  value={vencPeligrosas}
                  onChange={(e) => setVencPeligrosas(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                  Cargas Generales
                </label>
                <input
                  type="date"
                  value={vencGenerales}
                  onChange={(e) => setVencGenerales(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                  Examen Psicofísico
                </label>
                <input
                  type="date"
                  value={vencPsicofisico}
                  onChange={(e) => setVencPsicofisico(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Guardar
                </button>
              </div>

            </form>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
              📋 Control Consolidado de Vencimientos por Chofer
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Nombre y Apellido</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Rol</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Licencia Conducir</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Cargas Peligrosas</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Cargas Generales</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Examen Psicofísico</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reporteCompleto.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No hay personal registrado en la base de datos.
                    </td>
                  </tr>
                ) : (
                  reporteCompleto.map((item, idx) => {
                    const esEdit = editandoNombre === item.nombre;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#0f172a' }}>{item.nombre}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{item.rol}</td>
                        
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {esEdit ? (
                            <input type="date" value={formEdit.vencimiento_licencia} onChange={e => setFormEdit({...formEdit, vencimiento_licencia: e.target.value})} style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          ) : (
                            <span style={{ color: item.vencimiento_licencia ? '#0f172a' : '#94a3b8' }}>
                              {item.vencimiento_licencia || 'Sin registrar'}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          {esEdit ? (
                            <input type="date" value={formEdit.vencimiento_cargas_peligrosas} onChange={e => setFormEdit({...formEdit, vencimiento_cargas_peligrosas: e.target.value})} style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          ) : (
                            <span style={{ color: item.vencimiento_cargas_peligrosas ? '#0f172a' : '#94a3b8' }}>
                              {item.vencimiento_cargas_peligrosas || 'Sin registrar'}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          {esEdit ? (
                            <input type="date" value={formEdit.vencimiento_cargas_generales} onChange={e => setFormEdit({...formEdit, vencimiento_cargas_generales: e.target.value})} style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          ) : (
                            <span style={{ color: item.vencimiento_cargas_generales ? '#0f172a' : '#94a3b8' }}>
                              {item.vencimiento_cargas_generales || 'Sin registrar'}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          {esEdit ? (
                            <input type="date" value={formEdit.vencimiento_psicofisico} onChange={e => setFormEdit({...formEdit, vencimiento_psicofisico: e.target.value})} style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          ) : (
                            <span style={{ color: item.vencimiento_psicofisico ? '#0f172a' : '#94a3b8' }}>
                              {item.vencimiento_psicofisico || 'Sin registrar'}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          {esEdit ? (
                            <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                              <button onClick={() => guardarEdicionRapida(item.nombre)} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
                              <button onClick={() => setEditandoNombre(null)} style={{ backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>X</button>
                            </div>
                          ) : (
                            <button onClick={() => iniciarEdicion(item)} style={{ backgroundColor: '#0f766e', color: '#fff', border: 'none', padding: '0.36rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Editar</button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}