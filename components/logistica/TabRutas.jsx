'use client';
import React from 'react';

export default function TabRutas({
  esChofer,
  choferSeleccionado,
  setChoferSeleccionado,
  vehiculoSeleccionado,
  setVehiculoSeleccionado,
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
  const pedidosChoferActual = pedidosPorChofer[choferSeleccionado] || [];
  const listaMostrada = pedidosChoferActual.filter(p => !pedidosArchivadosRuta.includes(p.id));

  return (
    <div>
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        {!esChofer && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Seleccionar Chofer:</label>
              <select 
                value={choferSeleccionado} 
                onChange={(e) => setChoferSeleccionado(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
              >
                {listaChoferes.map((ch, idx) => (
                  <option key={idx} value={ch.nombre}>{ch.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Seleccionar Vehículo Disponible:</label>
              <select 
                value={vehiculoSeleccionado} 
                onChange={(e) => setVehiculoSeleccionado(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
              >
                {flotaVehiculos.map((v, idx) => (
                  <option key={idx} value={v.dominio} disabled={v.enMantenimiento}>
                    {v.dominio} - {v.modelo} ({v.tipoMedicion === 'Horas' ? `${v.horas} Horas` : `${v.km} km`})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', padding: '5px 10px', borderRadius: '6px' }}>
              {vehiculoSeleccionado}
            </span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
                {esChofer ? 'Juan Pérez' : choferSeleccionado}
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Ruta activa para este chofer</span>
            </div>
          </div>
          {!esChofer && (
            <button 
              onClick={() => {
                const idsEntregados = pedidosChoferActual.filter(p => p.estado_entrega === 'Entregado').map(p => p.id);
                setPedidosArchivadosRuta([...new Set([...pedidosArchivadosRuta, ...idsEntregados])]);
              }}
              style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🗑️ Archivar Entregados (Limpiar Ruta)
            </button>
          )}
        </div>

        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 'bold' }}>📍 Recorrido Estimado de la Ruta:</span>
            <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>{kmTotalRuta || 830} KM Total</p>
          </div>
          <span style={{ fontSize: '12px', color: '#2563eb' }}>Hub: Maestro Pedernera 1217</span>
        </div>

        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#334155' }}>Paradas Asignadas a {choferSeleccionado}:</h4>
            {esChofer && (
              <button 
                onClick={() => setModalCierreFinalViaje(true)}
                style={{ padding: '8px 14px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🏁 Finalizar Viaje Completo (Cierre Hub)
              </button>
            )}
          </div>

          {listaMostrada.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginBottom: '15px' }}>
              No hay paradas asignadas todavía para este chofer. Selecciona pedidos abajo para agregarlos.
            </p>
          ) : (
            listaMostrada.map((p, idx) => {
              const telefonoCliente = p.telefono || p.celular || '3874556677';
              return (
                <div key={idx} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '15px' }}>#{p.id} - {p.cliente || p.Cliente || 'Cliente'}</strong> ({p.provincia || 'Salta'})
                      <a href={`tel:${telefonoCliente}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '50%', textDecoration: 'none', fontSize: '14px' }}>📞</a>
                    </div>
                    📍 Dirección: <strong>{p.direccion || p.Direccion}</strong> | 📦 Bultos: <strong>{p.bultos || 1}</strong>
                    <br/>Estado: <strong style={{ color: p.estado_entrega === 'Entregado' ? '#166534' : '#854d0e', backgroundColor: p.estado_entrega === 'Entregado' ? '#dcfce7' : '#fef9c3', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{p.estado_entrega || 'Pendiente'}</strong>
                  </div>
                  {esChofer && (
                    <button onClick={() => { setPedidoACerrar(p); setModalCierreAbierto(true); }} style={{ padding: '8px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>📝 Cerrar Entrega / Viáticos</button>
                  )}
                </div>
              );
            })
          )}

          {!esChofer && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
              <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0f172a' }}>☑️ Seleccionar envíos pendientes para asignar a <strong>{choferSeleccionado}</strong>:</h5>
              {listaPedidosDisponibles.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No hay más pedidos disponibles.</p>
              ) : (
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', padding: '8px', marginBottom: '12px' }}>
                  {listaPedidosDisponibles.map((p) => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '13px' }}>
                      <input type="checkbox" checked={pedidosSeleccionadosCheckbox.includes(p.id)} onChange={() => toggleSeleccionPedidoCheckbox(p.id)} style={{ width: '16px', height: '16px', accentColor: '#047857', cursor: 'pointer' }} />
                      <div style={{ flex: 1 }}><strong>#{p.id} - {p.cliente || p.Cliente}</strong> ({p.provincia || 'Salta'}) | 📍 {p.direccion || p.Direccion} (Bultos: {p.bultos || 1})</div>
                    </label>
                  ))}
                </div>
              )}
              <button onClick={agregarPedidosSeleccionadosARuta} style={{ padding: '10px 18px', backgroundColor: '#047857', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>➕ Añadir Ruta con los pedidos seleccionados</button>
            </div>
          )}
        </div>

        {!esChofer && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
            <button onClick={optimizarRutaOrdenada} style={{ padding: '10px 20px', backgroundColor: '#facc15', color: '#713f12', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>⚡ Optimizar Ruta y Calcular KM Totales</button>
            <button onClick={enviarRutaWhatsApp} style={{ padding: '10px 20px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>📲 Enviar Ruta por WhatsApp</button>
          </div>
        )}
      </div>

      {!esChofer && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>📋 Reporte de Viajes Asignados y Organizados para Hoy</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>Visualiza todas las hojas de ruta listas por chofer.</p>

          {nombresChoferesConRuta.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Aún no has preparado viajes para ningún chofer hoy.</p>
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
                        <div key={p.id} style={{ padding: '10px 12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                          <div>
                            <span style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', marginRight: '10px', fontSize: '11px' }}>Parada #{index + 1}</span>
                            <strong>#{p.id} - {p.cliente || p.Cliente}</strong> ({p.provincia || 'Salta'}) | 📍 {p.direccion || p.Direccion}
                          </div>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>📦 Bultos: {p.bultos || 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}