'use client';
import React from 'react';

export default function TabRutas({
  esChofer,
  choferSeleccionado,
  setChoferSeleccionado,
  vehiculoSeleccionado,
  setVehiculoSeleccionado,
  vehiculoPorChofer = {},
  listaChoferes = [],
  flotaVehiculos = [],
  pedidosPorChofer = {},
  pedidosSeleccionadosCheckbox = [],
  toggleSeleccionPedidoCheckbox,
  agregarPedidosSeleccionadosARuta,
  quitarPedidoDeChofer,
  optimizarRutaOrdenada,
  optimizarRutaEspecificaChofer,
  enviarRutaWhatsApp,
  enviarRutaWhatsAppEspecifico,
  kmTotalRuta,
  pedidosArchivadosRuta = [],
  setPedidosArchivadosRuta,
  listaPedidosDisponibles = [],
  nombresChoferesConRuta = [],
  setModalCierreAbierto,
  setPedidoACerrar,
  setModalCierreFinalViaje,
  fechaFormateada
}) {
  const nombreChoferActivo = esChofer ? 'Juan Pérez' : choferSeleccionado;
  const pedidosChoferActual = pedidosPorChofer[nombreChoferActivo] || [];
  const listaMostrada = pedidosChoferActual.filter(p => !pedidosArchivadosRuta.includes(p.id));

  const abrirGoogleMaps = (direccion, localidad, provincia) => {
    const destinoFormatted = `${direccion}, ${localidad || 'Salta'}, ${provincia || 'Salta'}, Argentina`;
    const urlMaps = `https://www.google.com/maps/dir/?api=1&origin=Maestro+Pedernera+1217,+Salta&destination=${encodeURIComponent(destinoFormatted)}&travelmode=driving`;
    window.open(urlMaps, '_blank');
  };

  const vehiculosEnUsoPorOtros = Object.entries(vehiculoPorChofer)
    .filter(([nombreCh, patente]) => nombreCh !== choferSeleccionado && (pedidosPorChofer[nombreCh] || []).length > 0)
    .map(([_, patente]) => patente);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* VISTA PARA EL CHOFER EN RUTA */}
      {esChofer ? (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>🚚 Hoja de Ruta - {nombreChoferActivo}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Sigue las paradas asignadas y utiliza el botón de navegación GPS.</p>
            </div>
            <button onClick={() => setModalCierreFinalViaje(true)} style={{ backgroundColor: '#047857', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
              🏁 Finalizar Jornada de Viaje
            </button>
          </div>

          {listaMostrada.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>No tienes entregas pendientes asignadas por el momento.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {listaMostrada.map((p, index) => (
                <div key={p.id} style={{ padding: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', marginRight: '8px' }}>Parada #{index + 1}</span>
                    <strong style={{ fontSize: '15px' }}>#{p.id} - {p.cliente || p.Cliente}</strong>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>📍 {p.direccion || p.Direccion} ({p.localidad || 'Salta'}, {p.provincia || 'Salta'})</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>📦 Bultos: {p.bultos || 1}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => abrirGoogleMaps(p.direccion || p.Direccion, p.localidad, p.provincia)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      🗺️ Ver en Google Maps
                    </button>
                    <button onClick={() => { setPedidoACerrar(p); setModalCierreAbierto(true); }} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      📝 Registrar Entrega
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VISTA PANEL DE GESTIÓN LOGÍSTICA */
        <div>
          {/* PANEL DE ASIGNACIÓN */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Seleccionar Chofer:</label>
                <select 
                  value={choferSeleccionado} 
                  onChange={(e) => {
                    const nuevoChofer = e.target.value;
                    setChoferSeleccionado(nuevoChofer);
                    if (vehiculoPorChofer[nuevoChofer]) {
                      setVehiculoSeleccionado(vehiculoPorChofer[nuevoChofer]);
                    }
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                >
                  {listaChoferes.map((ch, idx) => (
                    <option key={idx} value={ch.nombre}>{ch.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Seleccionar Vehículo:</label>
                <select 
                  value={vehiculoSeleccionado} 
                  onChange={(e) => setVehiculoSeleccionado(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                >
                  {flotaVehiculos.map((v, idx) => {
                    const estaOcupado = vehiculosEnUsoPorOtros.includes(v.dominio) || v.enMantenimiento;
                    const choferQueLoOcupa = Object.keys(vehiculoPorChofer).find(ch => vehiculoPorChofer[ch] === v.dominio && ch !== choferSeleccionado);

                    return (
                      <option 
                        key={idx} 
                        value={v.dominio} 
                        disabled={estaOcupado}
                        style={{ backgroundColor: estaOcupado ? '#e2e8f0' : '#ffffff', color: estaOcupado ? '#94a3b8' : '#0f172a' }}
                      >
                        {v.dominio} - {v.modelo} {estaOcupado ? ` [Asignado a ${choferQueLoOcupa || 'Otro'}]` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>☑️ Seleccionar envíos pendientes para asignar a <strong>{choferSeleccionado}</strong>:</h4>
            {listaPedidosDisponibles.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No hay pedidos pendientes disponibles para asignar.</p>
            ) : (
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', padding: '8px', marginBottom: '12px' }}>
                {listaPedidosDisponibles.map((p) => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '13px' }}>
                    <input type="checkbox" checked={pedidosSeleccionadosCheckbox.includes(p.id)} onChange={() => toggleSeleccionPedidoCheckbox(p.id)} style={{ width: '16px', height: '16px', accentColor: '#047857' }} />
                    <div style={{ flex: 1 }}><strong>#{p.id} - {p.cliente || p.Cliente}</strong> ({p.provincia || 'Salta'}) | 📍 {p.direccion || p.Direccion} (Bultos: {p.bultos || 1})</div>
                  </label>
                ))}
              </div>
            )}
            <button onClick={agregarPedidosSeleccionadosARuta} style={{ padding: '10px 18px', backgroundColor: '#047857', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>➕ Añadir Ruta con los pedidos seleccionados</button>
          </div>

          {/* REPORTE CONSOLIDADO CON BOTÓN QUITAR */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>📋 Reporte de Viajes Asignados y Organizados para Hoy</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>Visualiza todas las hojas de ruta listas por chofer, optimiza su itinerario y envíales sus entregas en orden.</p>

            {nombresChoferesConRuta.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Aún no has preparado viajes para ningún chofer hoy. Selecciona pedidos arriba y haz clic en "Añadir Ruta".</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {nombresChoferesConRuta.map((nombreChofer, idx) => {
                  const listaPedidosChofer = pedidosPorChofer[nombreChofer] || [];
                  const maxDist = Math.max(...listaPedidosChofer.map(p => Number(p.kmDesdeCD || p.km_desde_cd || 50)));
                  const kmEstimado = Math.round(maxDist * 2.15);

                  return (
                    <div key={idx} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>🚚 Chofer: <strong>{nombreChofer}</strong></h4>
                          <span style={{ fontSize: '12px', color: '#047857', fontWeight: 'bold' }}>{listaPedidosChofer.length} entregas programadas | Recorrido aprox: {kmEstimado} KM</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => optimizarRutaEspecificaChofer(nombreChofer)} style={{ padding: '8px 14px', backgroundColor: '#facc15', color: '#713f12', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>⚡ Optimizar Ruta de este Chofer</button>
                          <button onClick={() => enviarRutaWhatsAppEspecifico(nombreChofer)} style={{ padding: '8px 14px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>📲 Enviar Orden por WhatsApp</button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {listaPedidosChofer.map((p, index) => (
                          <div key={p.id} style={{ padding: '10px 12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', gap: '12px' }}>
                            <div>
                              <span style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', marginRight: '10px', fontSize: '11px' }}>Parada #{index + 1}</span>
                              <strong>#{p.id} - ({p.provincia || 'Salta'})</strong> | 📍 {p.direccion || p.Direccion}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>📦 Bultos: {p.bultos || 1}</span>
                              
                              {quitarPedidoDeChofer && (
                                <button 
                                  onClick={() => quitarPedidoDeChofer(nombreChofer, p.id)}
                                  title="Quitar pedido"
                                  style={{ padding: '6px 14px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  ❌ Quitar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}