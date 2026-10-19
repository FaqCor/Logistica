'use client';
import React from 'react';

export default function TabRutas({
  esChofer,
  choferSeleccionado,
  setChoferSeleccionado,
  vehiculoSeleccionado,
  setVehiculoSeleccionado,
  vehiculoPorChofer = {},
  listaChoferes,
  flotaVehiculos,
  pedidosPorChofer,
  pedidosSeleccionadosCheckbox,
  toggleSeleccionPedidoCheckbox,
  agregarPedidosSeleccionadosARuta,
  optimizarRutaOrdenada,
  optimizarRutaEspecificaChofer,
  enviarRutaWhatsApp,
  enviarRutaWhatsAppEspecifico,
  kmTotalRuta,
  pedidosArchivadosRuta,
  setPedidosArchivadosRuta,
  listaPedidosDisponibles,
  nombresChoferesConRuta,
  setModalCierreAbierto,
  setPedidoACerrar,
  setModalCierreFinalViaje,
  fechaFormateada
}) {
  // Si es chofer, forzamos el nombre a "Juan Pérez" o el email correspondiente
  const nombreChoferActivo = esChofer ? 'Juan Pérez' : choferSeleccionado;
  const pedidosChoferActual = pedidosPorChofer[nombreChoferActivo] || [];
  const listaMostrada = pedidosChoferActual.filter(p => !pedidosArchivadosRuta.includes(p.id));

  // Función para abrir la navegación directa en Google Maps GPS desde el Hub
  const abrirGoogleMaps = (direccion, localidad, provincia) => {
    const destinoFormatted = `${direccion}, ${localidad || 'Salta'}, ${provincia || 'Salta'}, Argentina`;
    const urlMaps = `https://www.google.com/maps/dir/?api=1&origin=Maestro+Pedernera+1217,+Salta&destination=${encodeURIComponent(destinoFormatted)}&travelmode=driving`;
    window.open(urlMaps, '_blank');
  };

  const vehiculosEnUsoPorOtros = Object.entries(vehiculoPorChofer)
    .filter(([nombreCh, patente]) => nombreCh !== choferSeleccionado && (pedidosPorChofer[nombreCh] || []).length > 0)
    .map(([_, patente]) => patente);

  return (
    <div>
      {/* PANEL DE SELECCIÓN Y ASIGNACIÓN (SOLO LOGÍSTICA) */}
      {!esChofer && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
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
      )}

      {/* VISTA ACTIVA DEL CHOFER O DEL ENCARGADO */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
              {esChofer ? '🛣️ Mi Hoja de Ruta Asignada' : `Ruta Activa: ${choferSeleccionado}`}
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Hub de Salida: Maestro Pedernera 1217</span>
          </div>

          {esChofer && (
            <button onClick={() => setModalCierreFinalViaje(true)} style={{ padding: '10px 16px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
              🏁 Finalizar Viaje (Cierre Hub)
            </button>
          )}
        </div>

        {listaMostrada.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              {esChofer ? 'No tienes pedidos asignados en este momento. El encargado de logística te los asignará en breve.' : `No hay paradas asignadas todavía para ${choferSeleccionado}.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {listaMostrada.map((p, idx) => {
              const telefonoCliente = p.telefono || p.celular || '3874556677';
              return (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', borderLeft: '6px solid #0284c7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', marginRight: '8px', fontSize: '11px' }}>
                        PARADA #{idx + 1}
                      </span>
                      <strong style={{ fontSize: '16px', color: '#0f172a' }}>#{p.id} - {p.cliente || p.Cliente || 'Cliente'}</strong> ({p.provincia || 'Salta'})
                    </div>
                    <span style={{ fontSize: '12px', color: p.estado_entrega === 'Entregado' ? '#166534' : '#854d0e', backgroundColor: p.estado_entrega === 'Entregado' ? '#dcfce7' : '#fef9c3', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {p.estado_entrega || 'Pendiente'}
                    </span>
                  </div>

                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#334155' }}>📍 <strong>Dirección:</strong> {p.direccion || p.Direccion} ({p.localidad || 'Salta'})</p>
                  <p style={{ margin: '4px 0 12px 0', fontSize: '13px', color: '#334155' }}>📦 <strong>Bultos:</strong> {p.bultos || 1}</p>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* BOTÓN GOOGLE MAPS GPS */}
                    <button 
                      onClick={() => abrirGoogleMaps(p.direccion || p.Direccion, p.localidad, p.provincia)}
                      style={{ padding: '10px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      🗺️ Navegar con Google Maps
                    </button>

                    <a href={`tel:${telefonoCliente}`} style={{ padding: '10px 14px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📞 Llamar
                    </a>

                    {esChofer && (
                      <button onClick={() => { setPedidoACerrar(p); setModalCierreAbierto(true); }} style={{ padding: '10px 14px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                        📝 Rendir Entrega / Viáticos
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REPORTE CONSOLIDADO (SOLO LOGÍSTICA) */}
      {!esChofer && nombresChoferesConRuta.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>📋 Reporte de Viajes Asignados por Chofer</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {nombresChoferesConRuta.map((nombreCh, i) => (
              <div key={i} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', backgroundColor: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>🚚 Chofer: <strong>{nombreCh}</strong></h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#047857', fontWeight: 'bold' }}>{(pedidosPorChofer[nombreCh] || []).length} entregas asignadas</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}