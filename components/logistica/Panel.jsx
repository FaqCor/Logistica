'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Panel({ email }) {
  const esChofer = email && email.toLowerCase().includes('chofer'); 

  const [pestanaActiva, setPestanaActiva] = useState('gestion');

  // Estados de importación y datos
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosExcel, setDatosExcel] = useState([]);
  const [importando, setImportando] = useState(false);
  
  const [pedidosBD, setPedidosBD] = useState([]);
  const [pedidosAsignados, setPedidosAsignados] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState('');

  // Catálogo de choferes y vehículos
  const listaChoferes = [
    { id: 1, nombre: 'Juan Pérez' },
    { id: 2, nombre: 'Carlos Gómez' },
    { id: 3, nombre: 'Marcos Ruiz' }
  ];

  const [flotaVehiculos, setFlotaVehiculos] = useState([
    { dominio: 'NEB732', modelo: 'IVECO Daily', km: 124500, estado: 'Disponible', enMantenimiento: false },
    { dominio: 'AF997GV', modelo: 'Mercedes Benz Sprinter', km: 98200, estado: 'Disponible', enMantenimiento: false },
    { dominio: 'AD172YF', modelo: 'Mercedes Benz Atego', km: 210400, estado: 'Disponible', enMantenimiento: false }
  ]);

  const [choferSeleccionado, setChoferSeleccionado] = useState(listaChoferes[0].nombre);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(flotaVehiculos[0].dominio);

  // Estados para métricas de ruta y km acumulados
  const [kmTotalRuta, setKmTotalRuta] = useState(0);

  // Ejemplos predefinidos de prueba con distancias desde Centro de Distribución (Salta)
  const pedidosEjemplo = [
    { id: 101, cliente: 'Ferretería El Norte', provincia: 'Salta', localidad: 'General Güemes', direccion: 'Av. San Martín 450', bultos: 12, monto: 185000, kmDesdeCD: 50 },
    { id: 102, cliente: 'Corralón San Miguel', provincia: 'Tucumán', localidad: 'San Miguel de Tucumán', direccion: 'Av. Kirchner 1200', bultos: 45, monto: 620000, kmDesdeCD: 310 },
    { id: 103, cliente: 'Distribuidora del Centro', provincia: 'Santiago del Estero', localidad: 'Santiago Capital', direccion: 'Belgrano Sur 890', bultos: 30, monto: 410000, kmDesdeCD: 470 },
    { id: 104, cliente: 'Pinturería La Frontera', provincia: 'Salta', localidad: 'Tartagal', direccion: 'Ruta 34 Km 1430', bultos: 18, monto: 290000, kmDesdeCD: 360 }
  ];

  // Cierre y Gastos del chofer
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [pedidoACerrar, setPedidoACerrar] = useState(null);
  const [estadoEntrega, setEstadoEntrega] = useState('Entregado');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [montoTransferencia, setMontoTransferencia] = useState('');
  const [montoCheque, setMontoCheque] = useState('');
  const [requiereTaller, setRequiereTaller] = useState(false);

  // Desglose de viáticos / gastos por itinerario
  const [gastos, setGastos] = useState({
    desayuno: '',
    almuerzo: '',
    merienda: '',
    cena: '',
    hotel: '',
    otros: ''
  });

  const cargarPedidos = () => {
    fetch('/api/pedidos')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.pedidos.length > 0) {
          setPedidosBD(data.pedidos);
        } else {
          setPedidosBD(pedidosEjemplo);
        }
      })
      .catch(() => setPedidosBD(pedidosEjemplo));
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
    const pedidoObj = pedidosBD.find(p => p.id.toString() === pedidoSeleccionado.toString());
    if (pedidoObj && !pedidosAsignados.some(p => p.id === pedidoObj.id)) {
      setFlotaVehiculos(flotaVehiculos.map(v => v.dominio === vehiculoSeleccionado ? { ...v, estado: 'En Viaje' } : v));
      setPedidosAsignados([...pedidosAsignados, pedidoObj]);
    }
    setPedidoSeleccionado('');
  };

  // Optimización de Ruta e Integración de Kilometraje (Centro de Distribución -> Paradas -> Regreso)
  const optimizarRutaOrdenada = () => {
    if (pedidosAsignados.length === 0) {
      alert('Agrega al menos un pedido a la ruta para optimizar.');
      return;
    }

    const rutaOrdenada = [...pedidosAsignados].sort((a, b) => (a.kmDesdeCD || 100) - (b.kmDesdeCD || 100));
    
    // El punto más lejano determina la distancia base de ida + retorno
    const kmMaximo = Math.max(...rutaOrdenada.map(p => p.kmDesdeCD || 150));
    const kmTotalCalculado = Math.round(kmMaximo * 2.15); // Factor con recorridos urbanos e ida y vuelta
    
    setPedidosAsignados(rutaOrdenada);
    setKmTotalRuta(kmTotalCalculado);

    alert(`¡Ruta optimizada!\n\nSecuencia ordenada de entrega cargada.\nKilometraje total estimado (Ida + Entrega + Regreso a Centro de Distribución): ${kmTotalCalculado} km.`);
  };

  // Guardar cierre del chofer con gastos y km del pedido
  const guardarCierreChofer = async () => {
    if (!pedidoACerrar) return;

    const kmPedido = pedidoACerrar.kmDesdeCD || 120;
    const totalGastosPedido = 
      (parseFloat(gastos.desayuno) || 0) + 
      (parseFloat(gastos.almuerzo) || 0) + 
      (parseFloat(gastos.merienda) || 0) + 
      (parseFloat(gastos.cena) || 0) + 
      (parseFloat(gastos.hotel) || 0) + 
      (parseFloat(gastos.otros) || 0);

    try {
      const res = await fetch('/api/cerrar-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: pedidoACerrar.id,
          estadoEntrega,
          efectivo: montoEfectivo || 0,
          transferencia: montoTransferencia || 0,
          cheque: montoCheque || 0,
          gastos,
          kmRecorridos: kmPedido
        })
      });
      const result = await res.json();
      if (res.ok) {
        alert(`¡Pedido #${pedidoACerrar.id} cerrado!\nKM registrados: ${kmPedido} km.\nTotal viáticos de la parada: $${totalGastosPedido}`);
      }
    } catch (err) {
      alert(`Guardado localmente. Pedido #${pedidoACerrar.id} finalizado.`);
    }

    // Actualizamos lista local
    setPedidosAsignados(pedidosAsignados.map(p => p.id === pedidoACerrar.id ? {
      ...p,
      estado_entrega: estadoEntrega,
      monto_efectivo: montoEfectivo || 0,
      monto_transferencia: montoTransferencia || 0,
      monto_cheque: montoCheque || 0,
      monto_total_cobrado: (parseFloat(montoEfectivo) || 0) + (parseFloat(montoTransferencia) || 0) + (parseFloat(montoCheque) || 0),
      km_recorridos_pedido: kmPedido,
      gasto_total: totalGastosPedido
    } : p));

    setModalCierreAbierto(false);
    setPedidoACerrar(null);
    setMontoEfectivo('');
    setMontoTransferencia('');
    setMontoCheque('');
    setGastos({ desayuno: '', almuerzo: '', merienda: '', cena: '', hotel: '', otros: '' });
  };

  // Exportar Reportes de Cierre a Excel
  const exportarReporteExcel = () => {
    const datosExportar = (pedidosAsignados.length > 0 ? pedidosAsignados : pedidosBD).map(p => ({
      'N° Pedido': p.id,
      'Cliente': p.cliente || p.Cliente,
      'Provincia': p.provincia || 'Salta',
      'Dirección': p.direccion || p.Direccion,
      'Bultos': p.bultos || 1,
      'Estado Entrega': p.estado_entrega || 'Pendiente',
      'Efectivo ($)': p.monto_efectivo || 0,
      'Transferencia ($)': p.monto_transferencia || 0,
      'Cheque ($)': p.monto_cheque || 0,
      'Total Cobrado ($)': p.monto_total_cobrado || 0,
      'Desayuno ($)': p.gasto_desayuno || 0,
      'Almuerzo ($)': p.gasto_almuerzo || 0,
      'Merienda ($)': p.gasto_merienda || 0,
      'Cena ($)': p.gasto_cena || 0,
      'Hotel ($)': p.gasto_hotel || 0,
      'Otros Gastos ($)': p.gasto_otros || 0,
      'Total Viáticos ($)': p.gasto_total || 0,
      'KM Recorridos': p.km_recorridos_pedido || p.kmDesdeCD || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte_Cierres');
    XLSX.writeFile(workbook, `Reporte_Cierres_Logistica_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const cerrarSesion = () => {
    window.location.href = '/login';
  };

  const vehiculoActualObj = flotaVehiculos.find(v => v.dominio === vehiculoSeleccionado);

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
                📊 Reportes y Exportación
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

      {/* VISTA 1: GESTIÓN DE RUTAS Y ASIGNACIÓN */}
      {pestanaActiva === 'gestion' && (
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
                      {v.dominio} - {v.modelo} ({v.estado} {v.enMantenimiento ? ' [En Taller]' : ''})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ backgroundColor: '#0f172a', color: '#fff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
                {vehiculoSeleccionado}
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
                {esChofer ? 'Mi Unidad Asignada' : choferSeleccionado}
              </h2>
            </div>
            
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>
              Km Inicial Vehículo: {vehiculoActualObj?.km || 124500} km | Estado: <span style={{ color: vehiculoActualObj?.estado === 'En Viaje' ? '#d97706' : '#16a34a' }}>{vehiculoActualObj?.estado}</span>
            </div>
          </div>

          {/* MÉTRICA DE RUTA COMPLETA */}
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 'bold' }}>📍 Recorrido Total de la Ruta Estimado (Ida y Vuelta):</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>{kmTotalRuta} KM Total</p>
            </div>
            <span style={{ fontSize: '12px', color: '#2563eb' }}>Origen: Centro de Distribución Salta</span>
          </div>

          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>Paradas de la Ruta (Pedido N°, Provincia, Dirección, Bultos y KM paradas):</h4>
            {pedidosAsignados.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>No hay paradas asignadas en la ruta actual.</p>
            ) : (
              <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0 }}>
                {pedidosAsignados.map((p, idx) => (
                  <li key={idx} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '15px' }}>#{p.id} - {p.cliente || p.Cliente}</strong> ({p.provincia || 'Salta'})
                      <br/>📍 Dirección: <strong>{p.direccion || p.Direccion}</strong> | 📦 Bultos: <strong>{p.bultos || 1}</strong>
                      <br/>🛣️ Distancia desde CD: <strong>{p.kmDesdeCD || p.km_recorridos_pedido || 120} KM</strong> | Estado: <strong style={{ color: p.estado_entrega === 'Entregado' ? '#166534' : '#854d0e' }}>{p.estado_entrega || 'Pendiente'}</strong>
                    </div>
                    
                    {esChofer && (
                      <button 
                        onClick={() => { setPedidoACerrar(p); setModalCierreAbierto(true); }}
                        style={{ padding: '8px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        📝 Marcar Entregado / Viáticos
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
                  <option value="">Seleccionar pedido de prueba o importado (Provincia, Dirección, Bultos)...</option>
                  {pedidosBD.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.cliente} ({p.provincia || 'Salta'}) | {p.direccion} | Bultos: {p.bultos || 1} | KM: {p.kmDesdeCD || 100}
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
                ⚡ Optimizar Ruta y Calcular KM Totales
              </button>
              <button style={{ padding: '10px 20px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Enviar Ruta por WhatsApp
              </button>
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: REPORTES Y EXPORTACIÓN A EXCEL */}
      {pestanaActiva === 'reportes' && !esChofer && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
              📊 Reporte General de Cierres, Cobranzas y Viáticos de Itinerario
            </h3>
            <button 
              onClick={exportarReporteExcel}
              style={{ backgroundColor: '#15803d', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              📥 Exportar Reporte a Excel (.xlsx)
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                  <th style={{ padding: '10px' }}>N° Pedido</th>
                  <th style={{ padding: '10px' }}>Cliente / Prov.</th>
                  <th style={{ padding: '10px' }}>Estado</th>
                  <th style={{ padding: '10px' }}>Total Cobrado ($)</th>
                  <th style={{ padding: '10px' }}>Desayuno ($)</th>
                  <th style={{ padding: '10px' }}>Almuerzo ($)</th>
                  <th style={{ padding: '10px' }}>Merienda ($)</th>
                  <th style={{ padding: '10px' }}>Cena ($)</th>
                  <th style={{ padding: '10px' }}>Hotel ($)</th>
                  <th style={{ padding: '10px' }}>Otros ($)</th>
                  <th style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#991b1b' }}>Total Viáticos ($)</th>
                  <th style={{ padding: '10px', backgroundColor: '#eff6ff', color: '#1e40af' }}>KM Recorridos</th>
                </tr>
              </thead>
              <tbody>
                {(pedidosAsignados.length > 0 ? pedidosAsignados : pedidosBD).map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>#{p.id}</td>
                    <td style={{ padding: '10px' }}>{p.cliente || p.Cliente} ({p.provincia || 'Salta'})</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                        backgroundColor: p.estado_entrega === 'Entregado' ? '#dcfce7' : '#fef9c3',
                        color: p.estado_entrega === 'Entregado' ? '#166534' : '#854d0e'
                      }}>
                        {p.estado_entrega || 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#15803d' }}>${p.monto_total_cobrado || 0}</td>
                    <td style={{ padding: '10px' }}>${p.gasto_desayuno || 0}</td>
                    <td style={{ padding: '10px' }}>${p.gasto_almuerzo || 0}</td>
                    <td style={{ padding: '10px' }}>${p.gasto_merienda || 0}</td>
                    <td style={{ padding: '10px' }}>${p.gasto_cena || 0}</td>
                    <td style={{ padding: '10px' }}>${p.gasto_hotel || 0}</td>
                    <td style={{ padding: '10px' }}>${p.gasto_otros || 0}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#fff5f5', color: '#b91c1c' }}>
                      ${p.gasto_total || 0}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#f0f9ff', color: '#0369a1' }}>
                      {p.km_recorridos_pedido || p.kmDesdeCD || 0} KM
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE CIERRE DE PEDIDO Y REGISTRO DE VIÁTICOS DEL CHOFER */}
      {modalCierreAbierto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '550px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>Cierre de Parada y Registro de Viáticos</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
              Pedido #{pedidoACerrar?.id} - Cliente: <strong>{pedidoACerrar?.cliente || pedidoACerrar?.Cliente}</strong> ({pedidoACerrar?.provincia || 'Salta'})
            </p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Estado de Entrega:</label>
            <select value={estadoEntrega} onChange={(e) => setEstadoEntrega(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px', fontSize: '14px' }}>
              <option value="Entregado">Entregado</option>
              <option value="Pendiente">Pendiente (Solo Cobranza de Saldo)</option>
              <option value="No entregado">No entregado</option>
            </select>

            <h4 style={{ margin: '10px 0 8px 0', fontSize: '14px', color: '#047857' }}>💵 Desglose de Cobro Recibido:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '15px' }}>
              <input type="number" placeholder="Efectivo $" value={montoEfectivo} onChange={(e) => setMontoEfectivo(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <input type="number" placeholder="Transferencia $" value={montoTransferencia} onChange={(e) => setMontoTransferencia(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <input type="number" placeholder="Cheques $" value={montoCheque} onChange={(e) => setMontoCheque(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>

            <h4 style={{ margin: '10px 0 8px 0', fontSize: '14px', color: '#b91c1c' }}>🥐 Gastos e Itinerario de Viaje (Viáticos del Pedido):</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Desayuno ($):</label>
                <input type="number" placeholder="0.00" value={gastos.desayuno} onChange={(e) => setGastos({ ...gastos, desayuno: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Almuerzo ($):</label>
                <input type="number" placeholder="0.00" value={gastos.almuerzo} onChange={(e) => setGastos({ ...gastos, almuerzo: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Merienda ($):</label>
                <input type="number" placeholder="0.00" value={gastos.merienda} onChange={(e) => setGastos({ ...gastos, merienda: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Cena ($):</label>
                <input type="number" placeholder="0.00" value={gastos.cena} onChange={(e) => setGastos({ ...gastos, cena: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Hotel / Hospedaje ($):</label>
                <input type="number" placeholder="0.00" value={gastos.hotel} onChange={(e) => setGastos({ ...gastos, hotel: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Otros Gastos ($):</label>
                <input type="number" placeholder="0.00" value={gastos.otros} onChange={(e) => setGastos({ ...gastos, otros: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => setModalCierreAbierto(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardarCierreChofer} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#047857', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Confirmar Cierre y Viáticos</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IMPORTACIÓN DE EXCEL */}
      {modalAbierto && !esChofer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '600px', width: '90%' }}>
            <h3>Confirmar Importación de Ventas</h3>
            <p>Se cargaron {datosExcel.length} registros del archivo.</p>
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