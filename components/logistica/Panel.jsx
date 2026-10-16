'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Panel({ email }) {
  const esChofer = email && (email.toLowerCase().includes('chofer') || email.toLowerCase().includes('driver')); 

  const [pestanaActiva, setPestanaActiva] = useState('gestion');

  // Estado del checklist
  const [checklistEnviado, setChecklistEnviado] = useState(false);
  const [kmChecklist, setKmChecklist] = useState('54000');
  const [observacionesChecklist, setObservacionesChecklist] = useState('');
  const [enviandoChecklist, setEnviandoChecklist] = useState(false);

  // Fecha actual
  const hoy = new Date();
  const fechaFormateada = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

  // Estados de datos
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosExcel, setDatosExcel] = useState([]);
  const [importando, setImportando] = useState(false);
  
  const [pedidosBD, setPedidosBD] = useState([]);
  const [pedidosAsignados, setPedidosAsignados] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState('');

  // Estado local para ocultar entregados en la vista de rutas sin borrarlos de la BD ni del reporte
  const [pedidosArchivadosRuta, setPedidosArchivadosRuta] = useState([]);

  // --- PASO 1: NUEVOS ESTADOS PARA GESTIÓN DE FLOTA Y PERSONAL (CHOFERES Y AYUDANTES) ---
  const [personalEmpresa, setPersonalEmpresa] = useState([
    { id: 1, nombre: 'Juan Pérez', rol: 'Chofer', email: 'chofer@demo.com', telefono: '3874556677' },
    { id: 2, nombre: 'Carlos Gómez', rol: 'Chofer', email: 'carlos@dmmaestro.com', telefono: '3875112233' },
    { id: 3, nombre: 'Esteban Mamaní', rol: 'Ayudante', email: 'esteban@dmmaestro.com', telefono: '3876221144' }
  ]);

  const [nuevoNombrePersonal, setNuevoNombrePersonal] = useState('');
  const [nuevoRolPersonal, setNuevoRolPersonal] = useState('Chofer');
  const [nuevoEmailPersonal, setNuevoEmailPersonal] = useState('');
  const [nuevoTelPersonal, setNuevoTelPersonal] = useState('');

  const [nuevoDominioVehiculo, setNuevoDominioVehiculo] = useState('');
  const [nuevoModeloVehiculo, setNuevoModeloVehiculo] = useState('');
  const [nuevoKmVehiculo, setNuevoKmVehiculo] = useState('');

  // Flota y choferes
  const listaChoferes = personalEmpresa.filter(p => p.rol === 'Chofer');

  const [flotaVehiculos, setFlotaVehiculos] = useState([
    { dominio: 'NEB732', modelo: 'IVECO Daily', km: 124500, estado: 'Disponible', enMantenimiento: false },
    { dominio: 'AF997GV', modelo: 'Mercedes Benz Sprinter', km: 98200, estado: 'Disponible', enMantenimiento: false },
    { dominio: 'AD172YF', modelo: 'Mercedes Benz Atego', km: 210400, estado: 'Disponible', enMantenimiento: false }
  ]);

  const [choferSeleccionado, setChoferSeleccionado] = useState(listaChoferes[0]?.nombre || 'Juan Pérez');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(flotaVehiculos[0].dominio);

  // Pedidos iniciales
  const pedidosEjemplo = [
    { id: 101, cliente: 'Ferretería El Norte', provincia: 'Salta', localidad: 'General Güemes', direccion: 'Av. San Martín 450', bultos: 12, monto: 185000, kmDesdeCD: 50, estado_entrega: 'Pendiente', monto_total_cobrado: 0, gasto_total: 0 },
    { id: 102, cliente: 'Corralón San Miguel', provincia: 'Tucumán', localidad: 'San Miguel de Tucumán', direccion: 'Av. Kirchner 1200', bultos: 45, monto: 620000, kmDesdeCD: 310, estado_entrega: 'Pendiente', monto_total_cobrado: 0, gasto_total: 0 },
    { id: 103, cliente: 'Distribuidora del Centro', provincia: 'Santiago del Estero', localidad: 'Santiago Capital', direccion: 'Belgrano Sur 890', bultos: 30, monto: 410000, kmDesdeCD: 470, estado_entrega: 'Pendiente', monto_total_cobrado: 0, gasto_total: 0 }
  ];

  const [kmTotalRuta, setKmTotalRuta] = useState(0);

  // Modales
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [pedidoACerrar, setPedidoACerrar] = useState(null);
  const [estadoEntrega, setEstadoEntrega] = useState('Entregado');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [montoTransferencia, setMontoTransferencia] = useState('');
  const [montoCheque, setMontoCheque] = useState('');
  const [kmEntregaInterurbana, setKmEntregaInterurbana] = useState('');

  const [modalCierreFinalViaje, setModalCierreFinalViaje] = useState(false);
  const [kmFinalViajeSalta, setKmFinalViajeSalta] = useState('');

  const [gastos, setGastos] = useState({
    desayuno: '',
    almuerzo: '',
    merienda: '',
    cena: '',
    hotel: '',
    otros: ''
  });

  // --- PASO 2: FUNCIONES PARA REGISTRAR PERSONAL Y VEHÍCULOS ---
  const agregarPersonal = (e) => {
    e.preventDefault();
    if (!nuevoNombrePersonal) {
      alert('Por favor, ingresa el nombre del personal.');
      return;
    }

    const nuevoEmpleado = {
      id: personalEmpresa.length + 1,
      nombre: nuevoNombrePersonal,
      rol: nuevoRolPersonal,
      email: nuevoEmailPersonal || 'sincorreo@dmmaestro.com',
      telefono: nuevoTelPersonal || 'Sin teléfono'
    };

    setPersonalEmpresa([...personalEmpresa, nuevoEmpleado]);
    setNuevoNombrePersonal('');
    setNuevoEmailPersonal('');
    setNuevoTelPersonal('');
    alert(`¡${nuevoRolPersonal} "${nuevoEmpleado.nombre}" registrado con éxito!`);
  };

  const agregarVehiculo = (e) => {
    e.preventDefault();
    if (!nuevoDominioVehiculo || !nuevoModeloVehiculo) {
      alert('Por favor, ingresa la patente (dominio) y el modelo.');
      return;
    }

    const nuevoVeh = {
      dominio: nuevoDominioVehiculo.toUpperCase(),
      modelo: nuevoModeloVehiculo,
      km: parseFloat(nuevoKmVehiculo) || 0,
      estado: 'Disponible',
      enMantenimiento: false
    };

    setFlotaVehiculos([...flotaVehiculos, nuevoVeh]);
    setNuevoDominioVehiculo('');
    setNuevoModeloVehiculo('');
    setNuevoKmVehiculo('');
    alert(`¡Vehículo patente ${nuevoVeh.dominio} añadido a la flota correctamente!`);
  };

  // Cargar pedidos desde la BD en tiempo real
  const cargarPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos', { cache: 'no-store' });
      if (!res.ok) throw new Error('Error de conexión');
      const data = await res.json();
      if (data.success && Array.isArray(data.pedidos)) {
        setPedidosBD(data.pedidos);
      }
    } catch (err) {
      console.warn('Utilizando datos locales o cargados previamente.');
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    if (!esChofer) {
      cargarPedidos();
      const interval = setInterval(() => {
        cargarPedidos();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [pestanaActiva, esChofer]);

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
        // Limpiar los archivados locales de la vista operativa para recibir los nuevos del Excel
        setPedidosArchivadosRuta([]);
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
      alert('¡Checklist enviado correctamente!');
    }, 600);
  };

  const agregarPedidoRuta = () => {
    if (!pedidoSeleccionado) return;
    const listado = pedidosBD.length > 0 ? pedidosBD : pedidosEjemplo;
    const pedidoObj = listado.find(p => p.id.toString() === pedidoSeleccionado.toString());
    if (pedidoObj && !pedidosAsignados.some(p => p.id === pedidoObj.id)) {
      setFlotaVehiculos(flotaVehiculos.map(v => v.dominio === vehiculoSeleccionado ? { ...v, estado: 'En Viaje' } : v));
      setPedidosAsignados([...pedidosAsignados, pedidoObj]);
    }
    setPedidoSeleccionado('');
  };

  const optimizarRutaOrdenada = () => {
    const listaAOptimar = pedidosAsignados.length > 0 ? pedidosAsignados : (pedidosBD.length > 0 ? pedidosBD : pedidosEjemplo);
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

  const guardarCierreChofer = async () => {
    if (!pedidoACerrar) return;

    const esOtraProvincia = (pedidoACerrar.provincia || 'Salta').toLowerCase() !== 'salta';
    const kmPedido = esOtraProvincia ? (parseFloat(kmEntregaInterurbana) || pedidoACerrar.kmDesdeCD || 0) : (pedidoACerrar.kmDesdeCD || 0);
    
    const ef = parseFloat(montoEfectivo) || 0;
    const tr = parseFloat(montoTransferencia) || 0;
    const ch = parseFloat(montoCheque) || 0;
    const totalCobrado = ef + tr + ch;

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
          efectivo: ef,
          transferencia: tr,
          cheque: ch,
          gastos,
          kmRecorridos: kmPedido
        })
      });
      alert(`¡Pedido #${pedidoACerrar.id} registrado correctamente!`);
    } catch (err) {
      console.warn('Error guardando en backend.');
    }

    const actualizarLista = (lista) => lista.map(p => p.id === pedidoACerrar.id ? {
      ...p,
      estado_entrega: estadoEntrega,
      monto_efectivo: ef,
      monto_transferencia: tr,
      monto_cheque: ch,
      monto_total_cobrado: totalCobrado,
      km_recorridos_pedido: kmPedido,
      gasto_total: totalGastosPedido,
      fecha_cierre: new Date().toISOString()
    } : p);

    setPedidosAsignados(actualizarLista(pedidosAsignados.length > 0 ? pedidosAsignados : pedidosEjemplo));
    setPedidosBD(actualizarLista(pedidosBD.length > 0 ? pedidosBD : pedidosEjemplo));

    setModalCierreAbierto(false);
    setPedidoACerrar(null);
    setMontoEfectivo('');
    setMontoTransferencia('');
    setMontoCheque('');
    setKmEntregaInterurbana('');
    setGastos({ desayuno: '', almuerzo: '', merienda: '', cena: '', hotel: '', otros: '' });
    
    cargarPedidos();
  };

  const confirmarCierreFinalViaje = () => {
    if (!kmFinalViajeSalta) {
      alert('Ingresa el kilometraje final del vehículo al momento del regreso.');
      return;
    }
    alert(`¡Viaje finalizado con éxito!\nKilometraje final del vehículo registrado: ${kmFinalViajeSalta} km.`);
    setModalCierreFinalViaje(false);
    setKmFinalViajeSalta('');
  };

  const exportarReporteExcel = () => {
    const listaReporte = pedidosBD.length > 0 ? pedidosBD : (pedidosAsignados.length > 0 ? pedidosAsignados : pedidosEjemplo);
    const datosExportar = listaReporte.map(p => ({
      'Fecha': p.fecha_cierre ? new Date(p.fecha_cierre).toLocaleDateString() : (p.fecha_programada ? new Date(p.fecha_programada).toLocaleDateString() : '-'),
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
  const listaMostrada = (pedidosBD.length > 0 ? pedidosBD : pedidosAsignados).filter(p => !pedidosArchivadosRuta.includes(p.id));
  const listaReportes = pedidosBD.length > 0 ? pedidosBD : [];

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER VERDE OSCURO */}
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

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* TÍTULO Y PASO 3: BOTONERA DE NAVEGACIÓN */}
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
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { setPestanaActiva('gestion'); cargarPedidos(); }}
                style={{ backgroundColor: pestanaActiva === 'gestion' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                🗺️ Rutas y Asignación
              </button>
              <button 
                onClick={() => { setPestanaActiva('reportes'); cargarPedidos(); }}
                style={{ backgroundColor: pestanaActiva === 'reportes' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                📊 Reportes y Exportación
              </button>

              {/* BOTÓN PASO 3: FLOTA Y PERSONAL */}
              <button 
                onClick={() => setPestanaActiva('flotaPersonal')}
                style={{ backgroundColor: pestanaActiva === 'flotaPersonal' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                🚚 Flota y Personal
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

        {/* VISTA CHOFER: CHECKLIST */}
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
                  placeholder="Observaciones..."
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
          /* PESTAÑA 1: GESTIÓN DE RUTAS */
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
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {!esChofer && (
                    <button 
                      onClick={() => {
                        const idsEntregados = (pedidosBD.length > 0 ? pedidosBD : pedidosAsignados)
                          .filter(p => p.estado_entrega === 'Entregado')
                          .map(p => p.id);
                        setPedidosArchivadosRuta([...new Set([...pedidosArchivadosRuta, ...idsEntregados])]);
                      }}
                      style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🗑️ Archivar Entregados (Limpiar Ruta)
                    </button>
                  )}

                  <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>
                    Km Inicial: {vehiculoActualObj?.km || 124500} km | Estado: <span style={{ color: vehiculoActualObj?.estado === 'En Viaje' ? '#d97706' : '#16a34a' }}>{vehiculoActualObj?.estado}</span>
                  </div>
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

                {listaMostrada.map((p, idx) => {
                  const esOtraProvincia = (p.provincia || 'Salta').toLowerCase() !== 'salta';
                  const telefonoCliente = p.telefono || p.celular || '3874556677';

                  return (
                    <div key={idx} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '15px' }}>#{p.id} - {p.cliente || p.Cliente || 'Cliente'}</strong> ({p.provincia || 'Salta'})
                          
                          {/* Botón de Teléfono (Llamar / Contactar) */}
                          <a 
                            href={`tel:${telefonoCliente}`} 
                            title={`Llamar a ${p.cliente || 'cliente'} (${telefonoCliente})`}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '28px', 
                              height: '28px', 
                              backgroundColor: '#dcfce7', 
                              color: '#15803d', 
                              borderRadius: '50%', 
                              textDecoration: 'none',
                              fontSize: '14px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                          >
                            📞
                          </a>

                          {/* Botón de Basura (Quitar de la ruta activa) */}
                          {!esChofer && (
                            <button 
                              onClick={() => {
                                if (confirm(`¿Deseas quitar el pedido #${p.id} de la ruta activa?`)) {
                                  setPedidosArchivadosRuta([...pedidosArchivadosRuta, p.id]);
                                }
                              }}
                              title="Quitar pedido de la ruta"
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '28px', 
                                height: '28px', 
                                backgroundColor: '#fee2e2', 
                                color: '#b91c1c', 
                                border: 'none', 
                                borderRadius: '50%', 
                                cursor: 'pointer',
                                fontSize: '14px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>

                        📍 Dirección: <strong>{p.direccion || p.Direccion}</strong> | 📦 Bultos: <strong>{p.bultos || 1}</strong>
                        <br/>
                        <span style={{ fontSize: '12px', color: '#475569' }}>
                          Tipo de Recorrido: <strong>{esOtraProvincia ? 'Interurbano / Otra Provincia (Pide KM por parada)' : 'Local Salta Capital'}</strong>
                        </span>
                        <br/>Estado: <strong style={{ 
                          color: p.estado_entrega === 'Entregado' ? '#166534' : p.estado_entrega === 'Pendiente' ? '#854d0e' : '#991b1b',
                          backgroundColor: p.estado_entrega === 'Entregado' ? '#dcfce7' : p.estado_entrega === 'Pendiente' ? '#fef9c3' : '#fee2e2',
                          padding: '2px 6px', borderRadius: '4px', fontSize: '12px'
                        }}>{p.estado_entrega || 'Pendiente'}</strong>
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
                      <option value="">Seleccionar pedido para agregar a la ruta...</option>
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

        {/* PESTAÑA 2: REPORTES Y EXPORTACIÓN */}
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
                    <th style={{ padding: '10px' }}>Fecha</th>
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
                  {listaReportes.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', color: '#64748b' }}>
                        {p.fecha_cierre ? new Date(p.fecha_cierre).toLocaleDateString() : (p.fecha_programada ? new Date(p.fecha_programada).toLocaleDateString() : '-')}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>#{p.id}</td>
                      <td style={{ padding: '10px' }}>{p.cliente || p.Cliente}</td>
                      <td style={{ padding: '10px' }}>{p.provincia || 'Salta'}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                          backgroundColor: p.estado_entrega === 'Entregado' ? '#dcfce7' : p.estado_entrega === 'Pendiente' ? '#fef9c3' : '#fee2e2',
                          color: p.estado_entrega === 'Entregado' ? '#166534' : p.estado_entrega === 'Pendiente' ? '#854d0e' : '#991b1b'
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

        {/* PASO 4: PESTAÑA DE FLOTA Y PERSONAL */}
        {pestanaActiva === 'flotaPersonal' && !esChofer && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              🏢 Administración de Flota y Personal (Choferes y Ayudantes)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              
              {/* FORMULARIO PERSONAL */}
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#064e3b', fontSize: '16px' }}>➕ Registrar Nuevo Personal</h4>
                <form onSubmit={agregarPersonal}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Nombre y Apellido:</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Marcos Ruiz" 
                      value={nuevoNombrePersonal} 
                      onChange={(e) => setNuevoNombrePersonal(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Clasificación / Rol:</label>
                    <select 
                      value={nuevoRolPersonal} 
                      onChange={(e) => setNuevoRolPersonal(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                    >
                      <option value="Chofer">Chofer</option>
                      <option value="Ayudante">Ayudante</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Correo Electrónico:</label>
                    <input 
                      type="email" 
                      placeholder="correo@dmmaestro.com" 
                      value={nuevoEmailPersonal} 
                      onChange={(e) => setNuevoEmailPersonal(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Teléfono / Celular:</label>
                    <input 
                      type="text" 
                      placeholder="387..." 
                      value={nuevoTelPersonal} 
                      onChange={(e) => setNuevoTelPersonal(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#047857', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Guardar Personal
                  </button>
                </form>
              </div>

              {/* FORMULARIO VEHÍCULO */}
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#064e3b', fontSize: '16px' }}>🚛 Registrar Nuevo Vehículo (Flota)</h4>
                <form onSubmit={agregarVehiculo}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Patente / Dominio:</label>
                    <input 
                      type="text" 
                      placeholder="AE123ZZ" 
                      value={nuevoDominioVehiculo} 
                      onChange={(e) => setNuevoDominioVehiculo(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'uppercase' }}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Modelo / Tipo:</label>
                    <input 
                      type="text" 
                      placeholder="Mercedes Benz Sprinter" 
                      value={nuevoModeloVehiculo} 
                      onChange={(e) => setNuevoModeloVehiculo(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Kilometraje Inicial:</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={nuevoKmVehiculo} 
                      onChange={(e) => setNuevoKmVehiculo(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Añadir a la Flota
                  </button>
                </form>
              </div>

            </div>

            {/* TABLAS LISTADOS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>👥 Plantel Registrado (Choferes y Ayudantes)</h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '8px' }}>Nombre</th>
                        <th style={{ padding: '8px' }}>Rol</th>
                        <th style={{ padding: '8px' }}>Contacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personalEmpresa.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.nombre}</td>
                          <td style={{ padding: '8px' }}>
                            <span style={{ 
                              padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                              backgroundColor: p.rol === 'Chofer' ? '#dcfce7' : '#e0f2fe',
                              color: p.rol === 'Chofer' ? '#166534' : '#0369a1'
                            }}>
                              {p.rol}
                            </span>
                          </td>
                          <td style={{ padding: '8px', color: '#64748b' }}>{p.telefono}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>🚛 Vehículos de la Flota</h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '8px' }}>Patente</th>
                        <th style={{ padding: '8px' }}>Modelo</th>
                        <th style={{ padding: '8px' }}>Km Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flotaVehiculos.map((v, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', fontWeight: 'bold', fontFamily: 'monospace' }}>{v.dominio}</td>
                          <td style={{ padding: '8px' }}>{v.modelo}</td>
                          <td style={{ padding: '8px', color: '#0284c7', fontWeight: 'bold' }}>{v.km} km</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* MODAL CIERRE PEDIDO */}
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

            {(pedidoACerrar?.provincia || 'Salta').toLowerCase() !== 'salta' && (
              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#1e40af', marginBottom: '4px' }}>
                  KM Recorridos en esta Parada Interurbana / Provincia:
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

      {/* MODAL CIERRE FINAL VIAJE */}
      {modalCierreFinalViaje && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>🏁 Cierre Final del Viaje</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
              Ingresa el kilometraje final marcado por el vehículo al regresar al Centro de Distribución.
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

      {/* MODAL IMPORTACIÓN */}
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