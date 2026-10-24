'use client';
import React, { useState, useEffect } from 'react';

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
  listaClientesDb = [], // <-- Clientes traídos directamente de Neon (tabla clientes)
  nombresChoferesConRuta = [],
  setModalCierreAbierto,
  modalCierreAbierto = false,
  pedidoACerrar = null,
  setPedidoACerrar,
  setModalCierreFinalViaje,
  fechaFormateada
}) {
  const nombreChoferActivo = esChofer ? 'Juan Pérez' : choferSeleccionado;
  const pedidosChoferActual = pedidosPorChofer[nombreChoferActivo] || [];
  const listaMostrada = pedidosChoferActual.filter(p => !pedidosArchivadosRuta.includes(p.id));

  // Estado local para los montos a cobrar por cada pedido disponible
  const [montosACobrar, setMontosACobrar] = useState({});
  // Estado para el filtro desplegable de clientes
  const [clienteFiltroSeleccionado, setClienteFiltroSeleccionado] = useState('TODOS');

  // Estados internos para el funcionamiento del modal de cierre de parada
  const [estadoEntregaModal, setEstadoEntregaModal] = useState('ENTREGADO');
  const [montoRealModal, setMontoRealModal] = useState('');
  const [observacionesModal, setObservacionesModal] = useState('');

  useEffect(() => {
    const inicial = {};
    listaPedidosDisponibles.forEach(p => {
      inicial[p.id] = p.monto_a_cobrar || 0;
    });
    setMontosACobrar(inicial);
  }, [listaPedidosDisponibles]);

  useEffect(() => {
    if (pedidoACerrar) {
      setMontoRealModal(pedidoACerrar.monto_a_cobrar || 0);
      setEstadoEntregaModal('ENTREGADO');
      setObservacionesModal('');
    }
  }, [pedidoACerrar]);

  const handleMontoChange = (pedidoId, valor) => {
    setMontosACobrar(prev => ({
      ...prev,
      [pedidoId]: valor
    }));
  };

  const abrirGoogleMaps = (direccion, localidad, provincia) => {
    const destinoFormatted = `${direccion}, ${localidad || 'Salta'}, ${provincia || 'Salta'}, Argentina`;
    const urlMaps = `https://www.google.com/maps/dir/?api=1&origin=Maestro+Pedernera+1217,+Salta&destination=${encodeURIComponent(destinoFormatted)}&travelmode=driving`;
    window.open(urlMaps, '_blank');
  };

  // Función de ayuda para obtener la razón social cruzando Neon por dirección o por campo previo
  const obtenerNombreCliente = (p) => {
    if (p.razon_social) return p.razon_social;
    if (p.razonSocial) return p.razonSocial;
    
    // Intenta buscar coincidencia por dirección en la lista de clientes de Neon
    if (listaClientesDb && listaClientesDb.length > 0 && (p.direccion || p.Direccion)) {
      const dirPedido = (p.direccion || p.Direccion).toLowerCase().trim();
      const coincidencia = listaClientesDb.find(c => c.direccion && dirPedido.includes(c.direccion.toLowerCase().trim()));
      if (coincidencia && coincidencia.razon_social) {
        return coincidencia.razon_social;
      }
    }

    if (p.cliente && p.cliente !== 'Cliente' && !p.cliente.startsWith('(')) return p.cliente;
    if (p.Cliente && p.Cliente !== 'Cliente' && !p.Cliente.startsWith('(')) return p.Cliente;

    return 'Cliente Sin Especificar';
  };

  const enviarWhatsAppChofer = (nombreCh) => {
    const actual = pedidosPorChofer[nombreCh] || [];
    if (actual.length === 0) {
      alert(`No hay pedidos asignados a ${nombreCh}.`);
      return;
    }

    const vehiculoCh = vehiculoPorChofer[nombreCh] || vehiculoSeleccionado || 'No asignado';
    const origenEncoded = encodeURIComponent("Maestro Pedernera 1217, Salta, Argentina");

    let msg = `🚛 *HOJA DE RUTA - ${nombreCh.toUpperCase()}*\n`;
    msg += `📅 *Fecha:* ${fechaFormateada}\n`;
    msg += `🚐 *Vehículo:* ${vehiculoCh}\n`;
    msg += `📍 *Origen:* Maestro Pedernera 1217, Salta\n`;
    msg += `------------------------------------\n\n`;

    actual.forEach((p, i) => {
      const clienteNombre = obtenerNombreCliente(p);
      const direccionTexto = p.direccion || p.Direccion || 'Dirección no especificada';
      const provinciaTexto = p.provincia || 'Salta';
      const bultosCant = p.bultos || 1;
      const monto = Number(p.monto_a_cobrar || 0);

      const destinoEncoded = encodeURIComponent(`${direccionTexto}, ${provinciaTexto}, Argentina`);
      const linkMaps = `https://www.google.com/maps/dir/?api=1&origin=${origenEncoded}&destination=${destinoEncoded}&travelmode=driving`;

      msg += `📍 *PARADA #${i + 1} - Pedido #${p.id}*\n`;
      msg += `🏢 *Cliente:* ${clienteNombre}\n`;
      msg += `📍 *Dirección:* ${direccionTexto} (${provinciaTexto})\n`;
      msg += `📦 *Bultos:* ${bultosCant}\n`;
      msg += `💵 *Cobro:* ${monto > 0 ? `$${monto.toLocaleString('es-AR')}` : 'Sin cobro'}\n`;
      msg += `🗺️ *Navegar con Maps:*\n${linkMaps}\n\n`;
    });

    msg += `------------------------------------\n`;
    msg += `⚠️ *Aviso:* Registrar la entrega o cobro en el sistema al finalizar la parada.`;

    const urlWA = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(urlWA, '_blank');
  };

  const guardarCierreParada = () => {
    if (!pedidoACerrar) return;

    pedidoACerrar.estadoEntrega = estadoEntregaModal;
    pedidoACerrar.monto_cobrado_real = parseFloat(montoRealModal) || 0;
    pedidoACerrar.observacionesEntrega = observacionesModal;

    if (setPedidosArchivadosRuta) {
      setPedidosArchivadosRuta(prev => [...prev, pedidoACerrar.id]);
    }

    setModalCierreAbierto(false);
    setPedidoACerrar(null);
    alert(`Parada #${pedidoACerrar.id} registrada exitosamente como: ${estadoEntregaModal}`);
  };

  const vehiculosEnUsoPorOtros = Object.entries(vehiculoPorChofer)
    .filter(([nombreCh, patente]) => nombreCh !== choferSeleccionado && (pedidosPorChofer[nombreCh] || []).length > 0)
    .map(([_, patente]) => patente);

  // Generación de lista de clientes para el desplegable desde Neon
  const listaClientesUnicos = listaClientesDb && listaClientesDb.length > 0 
    ? Array.from(new Set(listaClientesDb.map(c => c.razon_social).filter(Boolean)))
    : Array.from(new Set(listaPedidosDisponibles.map(p => obtenerNombreCliente(p)))).filter(Boolean);

  // Envíos filtrados según la razón social del cliente seleccionada en el desplegable
  const listaPedidosFiltradosPorCliente = listaPedidosDisponibles.filter(p => {
    if (clienteFiltroSeleccionado === 'TODOS') return true;
    const clientePedido = obtenerNombreCliente(p);
    return clientePedido === clienteFiltroSeleccionado;
  });

  const handleAnadirConMontos = () => {
    listaPedidosDisponibles.forEach(p => {
      if (pedidosSeleccionadosCheckbox.includes(p.id)) {
        p.monto_a_cobrar = parseFloat(montosACobrar[p.id]) || 0;
        p.clienteNombreFinal = obtenerNombreCliente(p);
      }
    });
    agregarPedidosSeleccionadosARuta();
  };

  return (
    <div style={{ fontFamily: 'sans-serif', position: 'relative' }}>
      {esChofer ? (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>🚚 Hoja de Ruta - {nombreChoferActivo}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Salida desde Hub central: Maestro Pedernera 1217.</p>
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
                    <strong style={{ fontSize: '15px' }}>#{p.id} - {obtenerNombreCliente(p)}</strong>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>📍 {p.direccion || p.Direccion} ({p.provincia || 'Salta'})</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>📦 Bultos: {p.bultos || 1} {p.monto_a_cobrar ? `| 💵 A Cobrar: $${Number(p.monto_a_cobrar).toLocaleString()}` : ''}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => abrirGoogleMaps(p.direccion || p.Direccion, p.localidad, p.provincia)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      🗺️ Ver en Google Maps
                    </button>
                    <button onClick={() => { setPedidoACerrar(p); setModalCierreAbierto(true); }} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      📝 Registrar Entrega (Entregado / No entregado)
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
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Seleccionar Chofer (Base Personal):</label>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Seleccionar Vehículo (Base Flota):</label>
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

            {/* DESPLEGABLE CON LOS CLIENTES DE LA BASE DE DATOS NEON (razon_social) */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Filtrar Envíos por Cliente (Base Clientes Neon):</label>
              <select 
                value={clienteFiltroSeleccionado}
                onChange={(e) => setClienteFiltroSeleccionado(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="TODOS">-- Todos los Clientes --</option>
                {listaClientesUnicos.map((cli, idx) => (
                  <option key={idx} value={cli}>{cli}</option>
                ))}
              </select>
            </div>

            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>☑️ Listado de Envíos (Base Envíos) y Espacio para Asignar Cobros a <strong>{choferSeleccionado}</strong>:</h4>
            
            {listaPedidosFiltradosPorCliente.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No hay envíos pendientes disponibles para este cliente.</p>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', padding: '8px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {listaPedidosFiltradosPorCliente.map((p) => {
                  const isChecked = pedidosSeleccionadosCheckbox.includes(p.id);
                  const nombreClienteCalculado = obtenerNombreCliente(p);
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid #f1f5f9', gap: '10px', background: isChecked ? '#f0fdf4' : '#fff', borderRadius: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', flex: 1, margin: 0 }}>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleSeleccionPedidoCheckbox(p.id)} style={{ width: '16px', height: '16px', accentColor: '#047857' }} />
                        <div><strong>#{p.id} - {nombreClienteCalculado}</strong> ({p.provincia || 'Salta'}) | 📍 {p.direccion || p.Direccion} (Bultos: {p.bultos || 1})</div>
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#047857' }}>Cobro a realizar ($):</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={montosACobrar[p.id] !== undefined ? montosACobrar[p.id] : ''}
                          onChange={(e) => handleMontoChange(p.id, e.target.value)}
                          disabled={!isChecked}
                          style={{
                            width: '100px',
                            padding: '5px 8px',
                            borderRadius: '4px',
                            border: '1px solid #059669',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#047857',
                            backgroundColor: isChecked ? '#fff' : '#f1f5f9'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <button onClick={handleAnadirConMontos} style={{ padding: '10px 18px', backgroundColor: '#047857', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>➕ Añadir Ruta con los pedidos seleccionados</button>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>📋 Reporte Inferior: Pedidos Asignados a cada Chofer y Ruta Óptima</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>Rutas ordenadas desde la distribuidora central en <strong>Maestro Pedernera 1217</strong> para optimizar el desplazamiento de cada chofer.</p>

            {nombresChoferesConRuta.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Aún no se han asignado rutas para hoy. Selecciona pedidos arriba y haz clic en "Añadir Ruta".</p>
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
                          <span style={{ fontSize: '12px', color: '#047857', fontWeight: 'bold' }}>Salida: Pedernera 1217 | {listaPedidosChofer.length} entregas | Recorrido aprox: {kmEstimado} KM</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => optimizarRutaEspecificaChofer(nombreChofer)} style={{ padding: '8px 14px', backgroundColor: '#facc15', color: '#713f12', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>⚡ Optimizar por Cercanía (Pedernera 1217)</button>
                          <button onClick={() => enviarWhatsAppChofer(nombreChofer)} style={{ padding: '8px 14px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>📲 Enviar Orden por WhatsApp al Chofer</button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {listaPedidosChofer.map((p, index) => {
                          const nombreClienteMostrado = obtenerNombreCliente(p);
                          return (
                            <div key={p.id} style={{ padding: '10px 12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', gap: '12px' }}>
                              <div>
                                <span style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', marginRight: '10px', fontSize: '11px' }}>Parada #{index + 1}</span>
                                <strong>#{p.id} - {nombreClienteMostrado}</strong> | 📍 {p.direccion || p.Direccion} {p.monto_a_cobrar ? `| 💵 Cobro Requerido: $${Number(p.monto_a_cobrar).toLocaleString()}` : ''}
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
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {modalCierreAbierto && pedidoACerrar && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
            width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>
              📝 Registrar Entrega - Pedido #{pedidoACerrar.id}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Cliente: <strong>{obtenerNombreCliente(pedidoACerrar)}</strong><br />
              Dirección: {pedidoACerrar.direccion || pedidoACerrar.Direccion}
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
                Estado de la Entrega:
              </label>
              <select
                value={estadoEntregaModal}
                onChange={(e) => setEstadoEntregaModal(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
              >
                <option value="ENTREGADO">✅ Entregado con Éxito</option>
                <option value="AUSENTE">❌ Cliente Ausente</option>
                <option value="RECHAZADO">🚫 Pedido Rechazado</option>
                <option value="DIRECCION_INCORRECTA">⚠️ Dirección Incorrecta / Incompleta</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
                Monto Real Cobrado ($):
              </label>
              <input
                type="number"
                step="0.01"
                value={montoRealModal}
                onChange={(e) => setMontoRealModal(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
                Observaciones / Novedades:
              </label>
              <textarea
                rows="3"
                placeholder="Ej. Dejado con encargado de recepción, pago por transferencia, etc."
                value={observacionesModal}
                onChange={(e) => setObservacionesModal(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => { setModalCierreAbierto(false); setPedidoACerrar(null); }}
                style={{ padding: '10px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancelar
              </button>
              <button
                onClick={guardarCierreParada}
                style={{ padding: '10px 18px', backgroundColor: '#047857', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                💾 Guardar Cierre de Parada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}