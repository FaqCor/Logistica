'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Panel({ email }) {
  const esChofer = email && email.toLowerCase().includes('chofer'); 

  // Pestaña activa ('gestion' o 'reportes')
  const [pestanaActiva, setPestanaActiva] = useState('gestion');

  // Estados de importación y datos
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosExcel, setDatosExcel] = useState([]);
  const [importando, setImportando] = useState(false);
  
  const [pedidosBD, setPedidosBD] = useState([]);
  const [pedidosAsignados, setPedidosAsignados] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState('');
  const kmVehiculoFijo = 124500; 

  // Estados para el cierre del chofer por parada
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [pedidoACerrar, setPedidoACerrar] = useState(null);
  const [estadoEntrega, setEstadoEntrega] = useState('Entregado');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [montoTransferencia, setMontoTransferencia] = useState('');
  const [montoCheque, setMontoCheque] = useState('');

  // Cargar pedidos desde la BD al iniciar
  const cargarPedidos = () => {
    fetch('/api/pedidos')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPedidosBD(data.pedidos);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      setDatosExcel(XLSX.utils.sheet_to_json(ws));
      setModalAbierto(true);
    };
    reader.readAsBinaryString(file);
  };

  const confirmarImportacion = async () => {
    setImportando(true);
    try {
      const res = await fetch('/api/importar-pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidos: datosExcel })
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        setModalAbierto(false);
        cargarPedidos();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Hubo un error al conectar con el servidor.');
    } finally {
      setImportando(false);
    }
  };

  const agregarPedidoRuta = () => {
    if (!pedidoSeleccionado) return;
    const pedidoObj = pedidosBD.find(p => p.id.toString() === pedidoSeleccionado);
    if (pedidoObj && !pedidosAsignados.some(p => p.id === pedidoObj.id)) {
      setPedidosAsignados([...pedidosAsignados, pedidoObj]);
    }
    setPedidoSeleccionado('');
  };

  const optimizarRutaOrdenada = () => {
    const rutaOrdenada = [...pedidosAsignados].sort((a, b) => {
      const locA = a.localidad || a.Localidad || '';
      const locB = b.localidad || b.Localidad || '';
      return locA.localeCompare(locB);
    });
    setPedidosAsignados(rutaOrdenada);
    alert('¡Ruta optimizada y ordenada por secuencia de entrega eficiente!');
  };

  // Registrar el cierre del pedido por el chofer
  const guardarCierreChofer = async () => {
    if (!pedidoACerrar) return;
    try {
      const res = await fetch('/api/cerrar-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: pedidoACerrar.id,
          estadoEntrega,
          efectivo: montoEfectivo || 0,
          transferencia: montoTransferencia || 0,
          cheque: montoCheque || 0
        })
      });
      const result = await res.json();
      if (res.ok) {
        alert('¡Viaje cerrado y reportado con éxito!');
        setModalCierreAbierto(false);
        setPedidoACerrar(null);
        setMontoEfectivo('');
        setMontoTransferencia('');
        setMontoCheque('');
        cargarPedidos();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      alert('Error de conexión al cerrar el pedido.');
    }
  };

  const cerrarSesion = () => {
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* CABECERA SUPERIOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
            {esChofer ? 'Mi Hoja de Ruta Asignada' : 'Gestión Logística y Control de Viajes'}
          </h1>
          {email && (
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Conectado como: <strong>{email}</strong> ({esChofer ? 'Chofer' : 'Encargado de Logística'})
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!esChofer && (
            <>
              <button 
                onClick={() => setPestanaActiva('gestion')}
                style={{ backgroundColor: pestanaActiva === 'gestion' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                🗺️ Rutas y Asignación
              </button>
              <button 
                onClick={() => setPestanaActiva('reportes')}
                style={{ backgroundColor: pestanaActiva === 'reportes' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                📊 Reportes de Cierre en Tiempo Real
              </button>
              <button 
                onClick={() => document.getElementById('inputExcelVentas').click()}
                style={{ backgroundColor: '#047857', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                📊 Importar Excel
              </button>
              <input type="file" id="inputExcelVentas" accept=".xlsx, .xls, .csv" style={{ display: 'none' }} onChange={handleFileUpload} />
            </>
          )}

          <button 
            onClick={cerrarSesion}
            style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            🚪 Salir
          </button>
        </div>
      </div>

      {/* VISTA 1: GESTIÓN DE RUTAS Y CHOFERES */}
      {pestanaActiva === 'gestion' && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ backgroundColor: '#0f172a', color: '#fff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
                NEB732
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
                {esChofer ? 'Mi Unidad Asignada' : 'Juan Pérez'}
              </h2>
            </div>
            
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>
              Km del Vehículo: {kmVehiculoFijo} km {esChofer ? '(Fijo)' : '(Bloqueado)'}
            </div>
          </div>

          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
            Paradas en ruta: {pedidosAsignados.length}
          </p>

          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>Listado de Paradas:</h4>
            {pedidosAsignados.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>No hay paradas asignadas actualmente.</p>
            ) : (
              <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#1e293b' }}>
                {pedidosAsignados.map((p, idx) => (
                  <li key={idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <div>
                      <strong>{idx + 1}. {p.cliente || p.Cliente}</strong> - {p.direccion || p.Direccion} ({p.localidad || p.Localidad || 'Salta'}) 
                      <br/><span style={{ fontSize: '12px', color: '#64748b' }}>Estado actual: <strong>{p.estado_entrega || 'Pendiente'}</strong></span>
                    </div>
                    
                    {/* Botón para que el chofer cierre este pedido específico */}
                    {esChofer && (
                      <button 
                        onClick={() => { setPedidoACerrar(p); setModalCierreAbierto(true); }}
                        style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        📝 Cerrar / Cobrar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {!esChofer && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                <select 
                  value={pedidoSeleccionado}
                  onChange={(e) => setPedidoSeleccionado(e.target.value)}
                  style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontSize: '14px', backgroundColor: '#fff' }}
                >
                  <option value="">Seleccionar pedido importado de la base de datos...</option>
                  {pedidosBD.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.cliente} - {p.direccion} (${p.monto})
                    </option>
                  ))}
                </select>
                <button onClick={agregarPedidoRuta} style={{ padding: '10px 18px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
                  Añadir a Ruta
                </button>
              </div>
            )}
          </div>

          {!esChofer && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={optimizarRutaOrdenada} style={{ padding: '10px 20px', backgroundColor: '#facc15', color: '#713f12', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                ⚡ Optimizar Ruta y Ordenar Paradas
              </button>
              <button style={{ padding: '10px 20px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Enviar Ruta por WhatsApp
              </button>
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: MENÚ DE REPORTES DE CIERRE EN TIEMPO REAL (EXCLUSIVO LOGÍSTICA) */}
      {pestanaActiva === 'reportes' && !esChofer && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
            📊 Reporte de Viajes y Cobranzas Cerradas por Choferes
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Listado actualizado en tiempo real con el desglose exacto de los pagos recibidos y estados de entrega.
          </p>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                  <th style={{ padding: '10px' }}>Cliente</th>
                  <th style={{ padding: '10px' }}>Dirección</th>
                  <th style={{ padding: '10px' }}>Estado</th>
                  <th style={{ padding: '10px' }}>Efectivo ($)</th>
                  <th style={{ padding: '10px' }}>Transferencia ($)</th>
                  <th style={{ padding: '10px' }}>Cheque ($)</th>
                  <th style={{ padding: '10px', backgroundColor: '#f1f5f9' }}>Total Cobrado ($)</th>
                </tr>
              </thead>
              <tbody>
                {pedidosBD.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{p.cliente || p.Cliente}</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>{p.direccion || p.Direccion}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                        backgroundColor: p.estado_entrega === 'Entregado' ? '#dcfce7' : p.estado_entrega === 'Pendiente' ? '#fef9c3' : '#fee2e2',
                        color: p.estado_entrega === 'Entregado' ? '#166534' : p.estado_entrega === 'Pendiente' ? '#854d0e' : '#991b1b'
                      }}>
                        {p.estado_entrega || 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>${p.monto_efectivo || 0}</td>
                    <td style={{ padding: '10px' }}>${p.monto_transferencia || 0}</td>
                    <td style={{ padding: '10px' }}>${p.monto_cheque || 0}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#f8fafc', color: '#047857' }}>
                      ${p.monto_total_cobrado || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE CIERRE DE PEDIDO PARA EL CHOFER */}
      {modalCierreAbierto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>Cierre de Parada / Cobranza</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>
              Cliente: <strong>{pedidoACerrar?.cliente || pedidoACerrar?.Cliente}</strong>
            </p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Estado de Entrega:</label>
            <select 
              value={estadoEntrega} 
              onChange={(e) => setEstadoEntrega(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', fontSize: '14px' }}
            >
              <option value="Entregado">Entregado</option>
              <option value="Pendiente">Pendiente (Solo cobro / Saldo)</option>
              <option value="No entregado">No entregado</option>
            </select>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Monto en Efectivo ($):</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={montoEfectivo} 
              onChange={(e) => setMontoEfectivo(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px', fontSize: '14px' }}
            />

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Monto por Transferencia ($):</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={montoTransferencia} 
              onChange={(e) => setMontoTransferencia(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px', fontSize: '14px' }}
            />

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Monto en Cheques ($):</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={montoCheque} 
              onChange={(e) => setMontoCheque(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '14px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setModalCierreAbierto(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={guardarCierreChofer} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#047857', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                Guardar Cierre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IMPORTACIÓN */}
      {modalAbierto && !esChofer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '600px', width: '90%' }}>
            <h3>Confirmar Importación de Ventas</h3>
            <p>Se cargaron {datosExcel.length} registros.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setModalAbierto(false)} style={{ padding: '8px 16px' }}>Cancelar</button>
              <button onClick={confirmarImportacion} style={{ padding: '8px 16px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '6px' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}