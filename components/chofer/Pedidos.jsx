'use client';
import React from 'react';

export default function Pedidos({ pedidos, setPedidoACerrar, setModalCierreAbierto, setModalIncidenciaAbierto }) {
  // Función para abrir la navegación en Google Maps
  const abrirGoogleMaps = (direccion, localidad, provincia) => {
    const destinoFormatted = `${direccion}, ${localidad || ''}, ${provincia || 'Salta'}, Argentina`;
    const urlMaps = `https://www.google.com/maps/dir/?api=1&origin=Maestro+Pedernera+1217,+Salta&destination=${encodeURIComponent(destinoFormatted)}&travelmode=driving`;
    window.open(urlMaps, '_blank');
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 'bold' }}>
          📦 Pedidos Asignados para Hoy ({pedidos.length})
        </h3>
        <span style={{ fontSize: '12px', color: '#047857', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
          En Hoja de Ruta
        </span>
      </div>

      {pedidos.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            No tienes pedidos asignados para hoy. El encargado de logística te notificará cuando se cargue tu hoja de ruta.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pedidos.map((pedido, index) => {
            const telefonoCliente = pedido.telefono || pedido.celular || '3874556677';
            const estaEntregado = pedido.estado_entrega === 'Entregado';

            return (
              <div 
                key={pedido.id || index}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '16px',
                  backgroundColor: estaEntregado ? '#f0fdf4' : '#ffffff',
                  borderLeft: `6px solid ${estaEntregado ? '#166534' : '#0284c7'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <span style={{ backgroundColor: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', marginRight: '8px' }}>
                      PARADA #{index + 1}
                    </span>
                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>
                      #{pedido.id} - {pedido.cliente || pedido.Cliente}
                    </strong>
                  </div>

                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: estaEntregado ? '#dcfce7' : '#fef9c3',
                    color: estaEntregado ? '#166534' : '#854d0e'
                  }}>
                    {pedido.estado_entrega || 'Pendiente'}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', marginBottom: '14px' }}>
                  <p style={{ margin: '2px 0' }}>📍 <strong>Dirección:</strong> {pedido.direccion || pedido.Direccion} ({pedido.localidad || 'Salta'}, {pedido.provincia || 'Salta'})</p>
                  <p style={{ margin: '2px 0' }}>📦 <strong>Bultos a entregar:</strong> {pedido.bultos || 1}</p>
                  {pedido.monto ? <p style={{ margin: '2px 0' }}>💰 <strong>Monto de cobro a rendir:</strong> ${Number(pedido.monto).toLocaleString()}</p> : null}
                </div>

                {/* BOTONERA ACCIÓN RÁPIDA CHOFER */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {/* BOTÓN GOOGLE MAPS */}
                  <button
                    onClick={() => abrirGoogleMaps(pedido.direccion || pedido.Direccion, pedido.localidad, pedido.provincia)}
                    style={{
                      flex: '1 1 180px',
                      padding: '10px 14px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    🗺️ Ir en Google Maps GPS
                  </button>

                  {/* BOTÓN LLAMAR */}
                  <a
                    href={`tel:${telefonoCliente}`}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    📞 Llamar
                  </a>

                  {/* BOTÓN CERRAR ENTREGA / REGISTRAR VIÁTICOS */}
                  <button
                    onClick={() => {
                      setPedidoACerrar(pedido);
                      setModalCierreAbierto(true);
                    }}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#064e3b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    📝 Rendir Entrega / Viáticos
                  </button>

                  {/* BOTÓN REGISTRAR INCIDENCIA */}
                  {setModalIncidenciaAbierto && (
                    <button
                      onClick={() => {
                        setPedidoACerrar(pedido);
                        setModalIncidenciaAbierto(true);
                      }}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      🚨 Incidencia
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}