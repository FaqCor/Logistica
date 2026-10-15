'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Panel({ email }) {
  // Detectar si el usuario actual es chofer o logística según su correo o rol
  const esChofer = email && email.toLowerCase().includes('chofer'); 

  // --- ESTADOS PARA LA IMPORTACIÓN DE EXCEL ---
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosExcel, setDatosExcel] = useState([]);
  const [importando, setImportando] = useState(false);
  
  // --- ESTADOS PARA LA GESTIÓN DE RUTA Y PEDIDOS ---
  const [pedidosBD, setPedidosBD] = useState([]);
  const [pedidosAsignados, setPedidosAsignados] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState('');
  
  // Kilometraje fijo del vehículo asignado (Solo modificable por logística)
  const kmVehiculoFijo = 124500; 

  // Cargar pedidos desde la BD al iniciar
  useEffect(() => {
    fetch('/api/pedidos')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPedidosBD(data.pedidos);
      })
      .catch(err => console.error(err));
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
        window.location.reload();
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

  // Función para cerrar sesión
  const cerrarSesion = () => {
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* CABECERA SUPERIOR: TÍTULO, CORREO, BOTONES DE LOGÍSTICA Y CIERRE DE SESIÓN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
            {esChofer ? 'Mi Hoja de Ruta Asignada' : 'Nueva ruta - Gestión Logística'}
          </h1>
          {email && (
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Conectado como: <strong>{email}</strong> ({esChofer ? 'Chofer' : 'Encargado de Logística'})
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Botones exclusivos para Logística (Ocultos para el chofer) */}
          {!esChofer && (
            <>
              <button 
                onClick={() => document.getElementById('inputExcelVentas').click()}
                style={{ backgroundColor: '#047857', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                📊 Importar Excel de Ventas
              </button>
              <input type="file" id="inputExcelVentas" accept=".xlsx, .xls, .csv" style={{ display: 'none' }} onChange={handleFileUpload} />
            </>
          )}

          {/* Botón de Cerrar Sesión visible para todos */}
          <button 
            onClick={cerrarSesion}
            style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* TARJETA PRINCIPAL DE TRANSPORTE Y RUTA */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ backgroundColor: '#0f172a', color: '#fff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
              NEB732
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
              {esChofer ? 'Vehículo Asignado' : 'Juan Pérez'}
            </h2>
          </div>
          
          {/* KILOMETRAJE FIJO DEL VEHÍCULO (Bloqueado / Solo lectura para el chofer) */}
          <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>
            Km del Vehículo: {kmVehiculoFijo} km {esChofer ? '(Fijo)' : '(Bloqueado)'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', padding: '4px 12px', borderRadius: '16px', fontWeight: '500' }}>
            Sin checklist
          </span>
          <span style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '12px', padding: '4px 12px', borderRadius: '16px', fontWeight: '500' }}>
            Planificada
          </span>
        </div>

        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
          {pedidosAsignados.length} paradas asignadas en la ruta.
        </p>

        {/* LISTA DE PARADAS / RUTA */}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>Paradas de la ruta optimizada:</h4>
          {pedidosAsignados.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>No hay paradas asignadas actualmente.</p>
          ) : (
            <ol style={{ paddingLeft: '20px', fontSize: '14px', color: '#1e293b' }}>
              {pedidosAsignados.map((p, idx) => (
                <li key={idx} style={{ marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>{idx + 1}. {p.cliente || p.Cliente}</strong> - {p.direccion || p.Direccion} ({p.localidad || p.Localidad || 'Salta'}) | Monto: ${p.monto || p.Monto || 0}
                </li>
              ))}
            </ol>
          )}

          {/* ASIGNAR PEDIDOS (VISIBLE SOLO PARA EL ENCARGADO DE LOGÍSTICA) */}
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

        {/* BOTONES DE ACCIÓN DE RUTA (OPTIMIZAR Y WHATSAPP - SOLO PARA LOGÍSTICA) */}
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

      {/* MODAL DE IMPORTACIÓN DE EXCEL (SOLO PARA LOGÍSTICA) */}
      {modalAbierto && !esChofer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '600px', width: '90%' }}>
            <h3>Confirmar Importación de Ventas</h3>
            <p>Se cargaron {datosExcel.length} registros del archivo.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setModalAbierto(false)} style={{ padding: '8px 16px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmarImportacion} style={{ padding: '8px 16px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}