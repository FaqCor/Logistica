'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Panel({ email }) {
  // Detección de sesión de chofer
  const esChofer = email && (email.toLowerCase().includes('chofer') || email.toLowerCase().includes('driver')); 

  const [pestanaActiva, setPestanaActiva] = useState('gestion');

  // Estado del checklist obligatorio del vehículo
  const [checklistEnviado, setChecklistEnviado] = useState(false);
  const [kmChecklist, setKmChecklist] = useState('54000');
  const [observacionesChecklist, setObservacionesChecklist] = useState('');
  const [enviandoChecklist, setEnviandoChecklist] = useState(false);

  // Fecha actual
  const hoy = new Date();
  const fechaFormateada = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

  // Estados de datos de la BD e importación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosExcel, setDatosExcel] = useState([]);
  const [importando, setImportando] = useState(false);
  
  const [pedidosBD, setPedidosBD] = useState([]);
  const [pedidosAsignados, setPedidosAsignados] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState('');

  // Lista de choferes y vehículos
  const listaChoferes = [
    { id: 1, nombre: 'Juan Pérez (chofer@demo.com)' },
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

  // Pedidos de prueba predeterminados
  const pedidosEjemplo = [
    { id: 101, cliente: 'Ferretería El Norte', provincia: 'Salta', localidad: 'General Güemes', direccion: 'Av. San Martín 450', bultos: 12, monto: 185000, kmDesdeCD: 50, estado_entrega: 'Pendiente' },
    { id: 102, cliente: 'Corralón San Miguel', provincia: 'Tucumán', localidad: 'San Miguel de Tucumán', direccion: 'Av. Kirchner 1200', bultos: 45, monto: 620000, kmDesdeCD: 310, estado_entrega: 'Pendiente' },
    { id: 103, cliente: 'Distribuidora del Centro', provincia: 'Santiago del Estero', localidad: 'Santiago Capital', direccion: 'Belgrano Sur 890', bultos: 30, monto: 410000, kmDesdeCD: 470, estado_entrega: 'Pendiente' }
  ];

  const [kmTotalRuta, setKmTotalRuta] = useState(0);

  // Modal de Cierre de Pedido / Gastos
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [pedidoACerrar, setPedidoACerrar] = useState(null);
  const [estadoEntrega, setEstadoEntrega] = useState('Entregado');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [montoTransferencia, setMontoTransferencia] = useState('');
  const [montoCheque, setMontoCheque] = useState('');
  const [kmEntregaInterurbana, setKmEntregaInterurbana] = useState('');

  // Modal de Cierre Final del Viaje Completo (para Salta Capital)
  const [modalCierreFinalViaje, setModalCierreFinalViaje] = useState(false);
  const [kmFinalViajeSalta, setKmFinalViajeSalta] = useState('');

  // Viáticos / Gastos
  const [gastos, setGastos] = useState({
    desayuno: '',
    almuerzo: '',
    merienda: '',
    cena: '',
    hotel: '',
    otros: ''
  });

  const cargarPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos');
      if (!res.ok) throw new Error('Error al conectar con la API');
      const data = await res.json();
      if (data.success && Array.isArray(data.pedidos) && data.pedidos.length > 0) {
        setPedidosBD(data.pedidos);
      } else {
        setPedidosBD(pedidosEjemplo);
      }
    } catch (err) {
      setPedidosBD(pedidosEjemplo);
    }
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
      alert('Error al conectar con el servidor.');
    } finally {
      setImportando(false);
    }
  };

  const enviarChecklistVehiculo = (e) => {
    e.preventDefault();
    setEnviandoChecklist(true);

    setTimeout(() => {
      setEnviandoChecklist(false);
      setChecklistEnviado(true);
      if (pedidosAsignados.length === 0) {
        setPedidosAsignados(pedidosBD.length > 0 ? pedidosBD : pedidosEjemplo);
      }
      alert('¡Checklist enviado correctamente! Ya puedes visualizar tu ruta y vehículo asignado.');
    }, 600);
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

  const optimizarRutaOrdenada = () => {
    const listaAOptimar = pedidosAsignados.length > 0 ? pedidosAsignados : pedidosBD;
    if (listaAOptimar.length === 0) {
      alert('Agrega al menos un pedido a la ruta para optimizar.');
      return;
    }

    const rutaOrdenada = [...listaAOptimar].sort((a, b) => (a.kmDesdeCD || 100) - (b.kmDesdeCD || 100));
    const kmMaximo = Math.max(...rutaOrdenada.map(p => p.kmDesdeCD || 150));
    const kmTotalCalculado = Math.round(kmMaximo * 2.15);
    
    setPedidosAsignados(rutaOrdenada);
    setKmTotalRuta(kmTotalCalculado);

    alert(`¡Ruta optimizada!\nKilometraje total de ruta estimado: ${kmTotalCalculado} km.`);
  };

  // Guardar cierre de un pedido individual (con km si es de otra provincia)
  const guardarCierreChofer = async () => {
    if (!pedidoACerrar) return;

    const esOtraProvincia = (pedidoACerrar.provincia || 'Salta').toLowerCase() !== 'salta';
    const kmPedido = esOtraProvincia ? (parseFloat(kmEntregaInterurbana) || pedidoACerrar.kmDesdeCD || 0) : 0;
    
    const totalGastosPedido = 
      (parseFloat(gastos.desayuno) || 0) + 
      (parseFloat(gastos.almuerzo) || 0) + 
      (parseFloat(gastos.merienda) || 0) + 
      (parseFloat(gastos.cena) || 0) + 
      (parseFloat(gastos.hotel) || 0) + 
      (parseFloat(gastos.otros) || 0);

    try {
      await fetch('/api/cerrar-pedido', {
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
      alert(`¡Pedido #${pedidoACerrar.id} registrado correctamente!`);
    } catch (err) {
      alert(`Pedido #${pedidoACerrar.id} actualizado.`);
    }

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
    setKmEntregaInterurbana('');
    setGastos({ desayuno: '', almuerzo: '', merienda: '', cena: '', hotel: '', otros: '' });
  };

  // Confirmar el cierre total del viaje (para entregas en Salta Capital)
  const confirmarCierreFinalViaje = () => {
    if (!kmFinalViajeSalta) {
      alert('Ingresa el kilometraje final del vehículo al momento del regreso.');
      return;
    }
    alert(`¡Viaje finalizado con éxito!\nKilometraje final del vehículo registrado: ${kmFinalViajeSalta} km.\nEl vehículo queda marcado como Disponible.`);
    setModalCierreFinalViaje(false);
    setKmFinalViajeSalta('');
  };

  const exportarReporteExcel = () => {
    const datosExportar = (pedidosAsignados.length > 0 ? pedidosAsignados : pedidosBD).map(p => ({
      'N° Pedido': p.id,
      'Cliente': p.cliente || p.Cliente,
      'Provincia': p.provincia || 'Salta',
      'Dirección': p.direccion || p.Direccion,
      'Bultos': p.bultos || 1,
      'Estado Entrega': p.estado_entrega || 'Pendiente',
      'Total Cobrado ($)': p.monto_total_cobrado || 0,
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
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER VERDE OSCURO (#064e3b) CON SALUDO, FECHA Y PATENTE */}
      <div style={{ backgroundColor: '#064e3b', color: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            Hola, {esChofer ? 'Juan' : 'Logística'}
          </h2>
          <span style={{ fontSize: '12px', color: '#a7f3d0' }}>
            {fechaFormateada}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* BADGE DE PATENTE MERCCOSUR / ARGENTINA */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid #0f172a',
            borderRadius: '6px',
            overflow: 'hidden',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}>
            <div style={{ backgroundColor: '#0284c7', width: '100%', height: '5px' }}></div>
            <span style={{ color: '#0f172a', fontWeight: '900', fontSize: '15px', padding: '2px 10px', fontFamily: 'monospace', letterSpacing: '1px' }}>
              {vehiculoSeleccionado}
            </span>
          </div>

          <button 
            onClick={cerrarSesion}
            style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid #ffffff',
              borderRadius: '6px',
              padding: '6px 14px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL DEL PANEL */}
      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* TÍTULO Y PESTAÑAS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
              {esChofer ? 'Mi Ruta y Transporte Asignado' : 'Gestión Logística y Control de Viajes'}
            </h1>
            {email && (
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                Conectado como: <strong>{email}</strong> ({esChofer ? 'Chofer' : 'Encargado de Logística'})
              </p>
            )}
          </div>
          
          {!esChofer && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            </div>
          )}
        </div>

        {/* CHECKLIST OBLIGATORIO DEL VEHÍCULO */}
        {esChofer && !checklistEnviado ? (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <form onSubmit={enviarChecklistVehiculo}>
              <div style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#92400e' }}>Control del vehículo</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#b45309' }}>
                  Complétalo antes de salir. Hasta que lo envíes no vas a ver los pedidos del día.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Km actual del vehículo</label>
                <input 
                  type="number" 
                  value={kmChecklist} 
                  onChange={(e) => setKmChecklist(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} 
                  required 
                />
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>Luces (altas, bajas, giro, freno)</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" style={{ flex: 1, padding: '10px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Está bien</button>
                  <button type="button" style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Tiene falla</button>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>Neumáticos y rueda de auxilio</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" style={{ flex: 1, padding: '10px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Está bien</button>
                  <button type="button" style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Tiene falla</button>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>Frenos</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" style={{ flex: 1, padding: '10px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Está bien</button>
                  <button type="button" style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Tiene falla</button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Observaciones (opcional)</label>
                <textarea 
                  rows="3" 
                  value={observacionesChecklist} 
                  onChange={(e) => setObservacionesChecklist(e.target.value)} 
                  placeholder="Observaciones de la unidad antes de partir..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={enviandoChecklist}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  backgroundColor: '#064e3b', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer' 
                }}
              >
                {enviandoChecklist ? 'Enviando...' : 'Enviar Checklist'}
              </button>
            </form>
          </div>
        ) : (
          /* HOJA DE RUTA Y PARADAS ASIGNADAS */
          pestanaActiva === 'gestion' && (
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

              {/* DETALLE DEL TRANSPORTE ASIGNADO AL CHOFER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    backgroundColor: '#0f172a', 
                    color: '#ffffff', 
                    fontFamily: 'sans-serif', 
                    fontSize: '13px', 
                    fontWeight: 'bold', 
                    padding: '5px 10px', 
                    borderRadius: '6px',
                    letterSpacing: '0.5px'
                  }}>
                    {vehiculoSeleccionado}
                  </span>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
                      {esChofer ? 'Juan Pérez' : choferSeleccionado}
                    </h2>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Transporte: <strong>{vehiculoActualObj?.modelo || 'IVECO Daily'}</strong>
                    </span>
                  </div>
                </div>
                
                <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>
                  Km Inicial: {vehiculoActualObj?.km || 124500} km | Estado: <span style={{ color: vehiculoActualObj?.estado === 'En Viaje' ? '#d97706' : '#16a34a' }}>{vehiculoActualObj?.estado}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 'bold' }}>📍 Recorrido Estimado de la Ruta:</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>{kmTotalRuta || 830} KM Total</p>
                </div>
                <span style={{ fontSize: '12px', color: '#2563eb' }}>Centro de Distribución Salta</span>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#334155' }}>Paradas Asignadas:</h4>
                  {esChofer && (
                    <button 
                      onClick={() => setModalCierreFinalViaje(true)}
                      style={{ padding: '8px 14px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🏁 Finalizar Viaje Completo (Cierre Salta)
                    </button>
                  )}
                </div>

                {(pedidosAsignados.length > 0 ? pedidosAsignados : pedidosEjemplo).map((p, idx) => {
                  const esOtraProvincia = (p.provincia || 'Salta').toLowerCase() !== 'salta';
                  return (
                    <div key={idx} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '15px' }}>#{p.id} - {p.cliente || p.Cliente}</strong> ({p.provincia || 'Salta'})
                        <br/>📍 Dirección: <strong>{p.direccion || p.Direccion}</strong> | 📦 Bultos: <strong>{p.bultos || 1}</strong>
                        <br/>
                        <span style={{ fontSize: '12px', color: '#475569' }}>
                          Tipo de Recorrido: <strong>{esOtraProvincia ? 'Interurbano / Otra Provincia (Pide KM por parada)' : 'Local Salta Capital'}</strong>
                        </span>
                        <br/>Estado: <strong style={{ color: p.estado_entrega === 'Entregado' ? '#166534' : '#854d0e' }}>{p.estado_entrega || 'Pendiente'}</strong>
                      </div>
                      
                      {esChofer && (
                        <button 
                          onClick={() => { setPedidoACerrar(p); setModalCierreAbierto(true); }}
                          style={{ padding: '8px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          📝 Cerrar Entrega / Viáticos
                        </button>
                      )}
                    </div>
                  );
                })}

                {!esChofer && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                    <select 
                      value={pedidoSeleccionado}
                      onChange={(e) => setPedidoSeleccionado(e.target.value)}
                      style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontSize: '14px', backgroundColor: '#fff' }}
                    >
                      <option value="">Seleccionar pedido de prueba o importado...</option>
                      {pedidosBD.map((p) => (
                        <option key={p.id} value={p.id}>
                          #{p.id} - {p.cliente} ({p.provincia || 'Salta'}) | {p.direccion}
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
          )
        )}

        {/* REPORTES Y EXPORTACIÓN */}
        {pestanaActiva === 'reportes' && !esChofer && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
                📊 Reporte General de Cierres, Cobranzas y Viáticos
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
                    <th style={{ padding: '10px' }}>Cliente</th>
                    <th style={{ padding: '10px' }}>Provincia</th>
                    <th style={{ padding: '10px' }}>Estado</th>
                    <th style={{ padding: '10px' }}>Total Cobrado ($)</th>
                    <th style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#991b1b' }}>Total Viáticos ($)</th>
                    <th style={{ padding: '10px', backgroundColor: '#eff6ff', color: '#1e40af' }}>KM Recorridos</th>
                  </tr>
                </thead>
                <tbody>
                  {(pedidosAsignados.length > 0 ? pedidosAsignados : pedidosBD).map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>#{p.id}</td>
                      <td style={{ padding: '10px' }}>{p.cliente || p.Cliente}</td>
                      <td style={{ padding: '10px' }}>{p.provincia || 'Salta'}</td>
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

      </div>

      {/* MODAL DE CIERRE DE PEDIDO Y REGISTRO DE VIÁTICOS */}
      {modalCierreAbierto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '550px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>Cierre de Parada y Viáticos</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
              Pedido #{pedidoACerrar?.id} - Cliente: <strong>{pedidoACerrar?.cliente || pedidoACerrar?.Cliente}</strong> ({pedidoACerrar?.provincia || 'Salta'})
            </p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Estado de Entrega:</label>
            <select value={estadoEntrega} onChange={(e) => setEstadoEntrega(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px', fontSize: '14px' }}>
              <option value="Entregado">Entregado</option>
              <option value="Pendiente">Pendiente (Solo Cobranza de Saldo)</option>
              <option value="No entregado">No entregado</option>
            </select>

            {/* SI ES OTRA PROVINCIA, SOLICITA EL KM DE LA PARADA */}
            {(pedidoACerrar?.provincia || 'Salta').toLowerCase() !== 'salta' && (
              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#1e40af', marginBottom: '4px' }}>
                  🛣️ KM Recorridos en esta Parada Interurbana / Provincia:
                </label>
                <input 
                  type="number" 
                  placeholder="Ej: 310" 
                  value={kmEntregaInterurbana} 
                  onChange={(e) => setKmEntregaInterurbana(e.target.value)} 
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '14px' }} 
                />
              </div>
            )}

            <h4 style={{ margin: '10px 0 8px 0', fontSize: '14px', color: '#047857' }}>💵 Desglose de Cobro Recibido:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '15px' }}>
              <input type="number" placeholder="Efectivo $" value={montoEfectivo} onChange={(e) => setMontoEfectivo(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <input type="number" placeholder="Transferencia $" value={montoTransferencia} onChange={(e) => setMontoTransferencia(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <input type="number" placeholder="Cheques $" value={montoCheque} onChange={(e) => setMontoCheque(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>

            <h4 style={{ margin: '10px 0 8px 0', fontSize: '14px', color: '#b91c1c' }}>🥐 Registro de Gastos e Itinerario:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' }}>
              <input type="number" placeholder="Desayuno $" value={gastos.desayuno} onChange={(e) => setGastos({ ...gastos, desayuno: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <input type="number" placeholder="Almuerzo $" value={gastos.almuerzo} onChange={(e) => setGastos({ ...gastos, almuerzo: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <input type="number" placeholder="Merienda $" value={gastos.merienda} onChange={(e) => setGastos({ ...gastos, merienda: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <input type="number" placeholder="Cena $" value={gastos.cena} onChange={(e) => setGastos({ ...gastos, cena: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <input type="number" placeholder="Hotel / Hospedaje $" value={gastos.hotel} onChange={(e) => setGastos({ ...gastos, hotel: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <input type="number" placeholder="Otros Gastos $" value={gastos.otros} onChange={(e) => setGastos({ ...gastos, otros: e.target.value })} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => setModalCierreAbierto(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardarCierreChofer} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#047857', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Confirmar Cierre</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CIERRE FINAL DEL VIAJE (PARA ENTREGAS EN SALTA CAPITAL) */}
      {modalCierreFinalViaje && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>🏁 Cierre Final del Viaje (Salta Capital)</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
              Ingresa el kilometraje final marcado por el odómetro del vehículo al regresar al Centro de Distribución.
            </p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>
              Kilometraje Final del Vehículo (KM):
            </label>
            <input 
              type="number" 
              placeholder="Ej: 124890" 
              value={kmFinalViajeSalta} 
              onChange={(e) => setKmFinalViajeSalta(e.target.value)} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', marginBottom: '20px' }} 
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setModalCierreFinalViaje(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmarCierreFinalViaje} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#064e3b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Finalizar y Liberar Vehículo</button>
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