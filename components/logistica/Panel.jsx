'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// Modulos separados (ubicados en la misma carpeta components/logistica/)
import TabRutas from './TabRutas';
import TabFlota from './TabFlota';
import TabCostos from './TabCostos';
import TabPedidos from './TabPedidos';

export default function Panel({ email }) {
  const esChofer = Boolean(email && (email.toLowerCase().includes('chofer') || email.toLowerCase().includes('driver'))); 
  const [pestanaActiva, setPestanaActiva] = useState('gestion');

  // --- ESTADOS DE CONTROL, CHECKLIST Y FECHA ---
  const [checklistEnviado, setChecklistEnviado] = useState(false);
  const [kmChecklist, setKmChecklist] = useState('54000');
  const [enviandoChecklist, setEnviandoChecklist] = useState(false);
  const hoy = new Date();
  const fechaFormateada = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

  // --- ESTADOS DE DATOS E IMPORTACIÓN EXCEL ---
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosExcel, setDatosExcel] = useState([]);
  const [importando, setImportando] = useState(false);
  const [pedidosBD, setPedidosBD] = useState([]);

  // --- PERSISTENCIA SEGURO CON LOCALSTORAGE ---
  const [pedidosPorChofer, setPedidosPorChofer] = useState({});
  const [vehiculoPorChofer, setVehiculoPorChofer] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const pedidosGuardados = localStorage.getItem('pedidosPorChofer');
        if (pedidosGuardados) setPedidosPorChofer(JSON.parse(pedidosGuardados));

        const vehiculosGuardados = localStorage.getItem('vehiculoPorChofer');
        if (vehiculosGuardados) setVehiculoPorChofer(JSON.parse(vehiculosGuardados));
      } catch (e) {
        console.error('Error al cargar datos guardados:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(pedidosPorChofer).length > 0) {
      localStorage.setItem('pedidosPorChofer', JSON.stringify(pedidosPorChofer));
    }
  }, [pedidosPorChofer]);

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(vehiculoPorChofer).length > 0) {
      localStorage.setItem('vehiculoPorChofer', JSON.stringify(vehiculoPorChofer));
    }
  }, [vehiculoPorChofer]);

  const limpiarHistorialRutas = () => {
    if (confirm('¿Estás seguro de que deseas borrar todo el historial de rutas asignadas?')) {
      setPedidosPorChofer({});
      setVehiculoPorChofer({});
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pedidosPorChofer');
        localStorage.removeItem('vehiculoPorChofer');
      }
      alert('Historial borrado con éxito.');
    }
  };

  // --- ESTADOS DE SELECCIÓN Y ARCHIVO ---
  const [pedidosSeleccionadosCheckbox, setPedidosSeleccionadosCheckbox] = useState([]);
  const [pedidosArchivadosRuta, setPedidosArchivadosRuta] = useState([]);

  // --- ESTADOS DE FLOTA Y MANTENIMIENTO ---
  const [flotaMantenimientoBD, setFlotaMantenimientoBD] = useState([]);
  const [nuevaPatenteMto, setNuevaPatenteMto] = useState('');
  const [nuevoModeloMto, setNuevoModeloMto] = useState('');
  const [nuevoKmActualMto, setNuevoKmActualMto] = useState('');
  const [nuevaFrecuenciaMto, setNuevaFrecuenciaMto] = useState('15000');
  const [nuevoUltimoMtoKm, setNuevoUltimoMtoKm] = useState('');
  const [nuevoTipoMto, setNuevoTipoMto] = useState('Service completo de aceite y filtros');
  const [nuevoCostoMto, setNuevoCostoMto] = useState('');
  const [filtroPatenteMto, setFiltroPatenteMto] = useState('');

  // --- PERSONAL Y VEHÍCULOS ---
  const [personalEmpresa, setPersonalEmpresa] = useState([
    { id: 1, nombre: 'Juan Pérez', rol: 'Chofer', email: 'chofer@demo.com', telefono: '3874556677' },
    { id: 2, nombre: 'Carlos Gómez', rol: 'Chofer', email: 'carlos@dmmaestro.com', telefono: '3875112233' }
  ]);
  const [nuevoNombrePersonal, setNuevoNombrePersonal] = useState('');
  const [nuevoRolPersonal, setNuevoRolPersonal] = useState('Chofer');
  const [nuevoEmailPersonal, setNuevoEmailPersonal] = useState('');
  const [nuevoTelPersonal, setNuevoTelPersonal] = useState('');

  const [nuevoDominioVehiculo, setNuevoDominioVehiculo] = useState('');
  const [nuevoModeloVehiculo, setNuevoModeloVehiculo] = useState('');
  const [nuevoKmVehiculo, setNuevoKmVehiculo] = useState('');
  const [tipoMedicionVehiculo, setTipoMedicionVehiculo] = useState('Kilómetros');
  const [nuevasHorasVehiculo, setNuevasHorasVehiculo] = useState('');

  const listaChoferes = personalEmpresa.filter(p => p.rol === 'Chofer');
  const [flotaVehiculos, setFlotaVehiculos] = useState([
    { dominio: 'NEB732', modelo: 'IVECO Daily', km: 124500, horas: 0, tipoMedicion: 'Kilómetros', estado: 'Disponible', enMantenimiento: false },
    { dominio: 'AF997GV', modelo: 'Mercedes Benz Sprinter', km: 98200, horas: 0, tipoMedicion: 'Kilómetros', estado: 'Disponible', enMantenimiento: false }
  ]);

  const [choferSeleccionado, setChoferSeleccionado] = useState(listaChoferes[0]?.nombre || 'Juan Pérez');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(flotaVehiculos[0]?.dominio || 'NEB732');

  const pedidosEjemplo = [
    { id: 101, cliente: 'Ferretería El Norte', provincia: 'Salta', localidad: 'General Güemes', direccion: 'Av. San Martín 450', bultos: 12, kmDesdeCD: 50, estado_entrega: 'Pendiente' },
    { id: 102, cliente: 'Corralón San Miguel', provincia: 'Tucumán', localidad: 'San Miguel de Tucumán', direccion: 'Av. Kirchner 1200', bultos: 45, kmDesdeCD: 310, estado_entrega: 'Pendiente' },
    { id: 103, cliente: 'Distribuidora del Centro', provincia: 'Santiago del Estero', localidad: 'Santiago Capital', direccion: 'Belgrano Sur 890', bultos: 30, kmDesdeCD: 470, estado_entrega: 'Pendiente' }
  ];

  const [kmTotalRuta, setKmTotalRuta] = useState(0);

  // --- MODALES DE CIERRE Y ENTREGAS ---
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [pedidoACerrar, setPedidoACerrar] = useState(null);
  const [estadoEntrega, setEstadoEntrega] = useState('Entregado');
  const [observacionEntrega, setObservacionEntrega] = useState('');
  const [modalCierreFinalViaje, setModalCierreFinalViaje] = useState(false);

  const listaTodasPatentes = Array.from(new Set([...flotaVehiculos.map(v => v.dominio), ...flotaMantenimientoBD.map(v => v.patente)])).filter(Boolean);

  const cargarDatosBD = async () => {
    try {
      const res = await fetch('/api/pedidos', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.pedidos)) setPedidosBD(data.pedidos);
      }
    } catch (err) {
      console.warn('Cargando base de datos local');
    }
  };

  useEffect(() => { cargarDatosBD(); }, []);

  // --- FUNCIONES DE ASIGNACIÓN Y NAVEGACIÓN ---
  const toggleSeleccionPedidoCheckbox = (idPedido) => {
    if (pedidosSeleccionadosCheckbox.includes(idPedido)) {
      setPedidosSeleccionadosCheckbox(pedidosSeleccionadosCheckbox.filter(id => id !== idPedido));
    } else {
      setPedidosSeleccionadosCheckbox([...pedidosSeleccionadosCheckbox, idPedido]);
    }
  };

  const agregarPedidosSeleccionadosARuta = () => {
    if (pedidosSeleccionadosCheckbox.length === 0) {
      alert('Por favor, selecciona al menos un pedido marcando su casilla.');
      return;
    }
    const listadoGlobal = pedidosBD.length > 0 ? pedidosBD : pedidosEjemplo;
    const pedidosAgn = listadoGlobal.filter(p => pedidosSeleccionadosCheckbox.includes(p.id));
    const actualAsignados = pedidosPorChofer[choferSeleccionado] || [];
    const combinados = [...actualAsignados, ...pedidosAgn.filter(nuevo => !actualAsignados.some(ex => ex.id === nuevo.id))];

    const nuevosPedidosPorChofer = { ...pedidosPorChofer, [choferSeleccionado]: combinados };
    const nuevosVehiculosPorChofer = { ...vehiculoPorChofer, [choferSeleccionado]: vehiculoSeleccionado };

    setPedidosPorChofer(nuevosPedidosPorChofer);
    setVehiculoPorChofer(nuevosVehiculosPorChofer);

    if (typeof window !== 'undefined') {
      localStorage.setItem('pedidosPorChofer', JSON.stringify(nuevosPedidosPorChofer));
      localStorage.setItem('vehiculoPorChofer', JSON.stringify(nuevosVehiculosPorChofer));
    }

    setFlotaVehiculos(flotaVehiculos.map(v => v.dominio === vehiculoSeleccionado ? { ...v, estado: 'En Viaje' } : v));
    setPedidosSeleccionadosCheckbox([]);
  };

  // FUNCION INDIVIDUAL PARA DESASIGNAR PEDIDO
  const quitarPedidoDeChofer = (nombreChofer, idPedido) => {
    const listaActual = pedidosPorChofer[nombreChofer] || [];
    const listaNueva = listaActual.filter(p => p.id !== idPedido);
    const actualizados = { ...pedidosPorChofer, [nombreChofer]: listaNueva };
    
    setPedidosPorChofer(actualizados);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pedidosPorChofer', JSON.stringify(actualizados));
    }
  };

  const optimizarRutaEspecificaChofer = (nombreChofer) => {
    const pedidosChoferTarget = pedidosPorChofer[nombreChofer] || [];
    if (pedidosChoferTarget.length === 0) return;
    const rutaOrdenada = [...pedidosChoferTarget].sort((a, b) => Number(a.kmDesdeCD || 50) - Number(b.kmDesdeCD || 50));
    const maxDist = Math.max(...rutaOrdenada.map(p => Number(p.kmDesdeCD || 50)));
    const kmTotalCalculado = Math.round(maxDist * 2.15);

    const actualizados = { ...pedidosPorChofer, [nombreChofer]: rutaOrdenada };
    setPedidosPorChofer(actualizados);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pedidosPorChofer', JSON.stringify(actualizados));
    }

    if (nombreChofer === choferSeleccionado) setKmTotalRuta(kmTotalCalculado);
    alert(`¡Ruta optimizada para ${nombreChofer}! Total: ${kmTotalCalculado} KM.`);
  };

  const optimizarRutaOrdenada = () => optimizarRutaEspecificaChofer(choferSeleccionado);

  const enviarRutaWhatsAppEspecifico = (nombreChofer) => {
    const listaAEnviar = pedidosPorChofer[nombreChofer] || [];
    if (listaAEnviar.length === 0) return;
    let mensaje = `🚛 *HOJA DE RUTA* - ${nombreChofer}\n`;
    listaAEnviar.forEach((p, idx) => {
      mensaje += `\n${idx + 1}. #${p.id} - ${p.cliente || p.Cliente} | 📍 ${p.direccion || p.Direccion}`;
    });
    const choferObj = personalEmpresa.find(p => p.nombre === nombreChofer);
    const tel = choferObj?.telefono ? choferObj.telefono.replace(/\D/g, '') : '3874556677';
    window.open(`https://wa.me/549${tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const enviarRutaWhatsApp = () => enviarRutaWhatsAppEspecifico(choferSeleccionado);

  // --- IMPORTACIÓN Y PROCESAMIENTO EXCEL ---
  const manejarArchivoExcel = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setImportando(true);
    const lector = new FileReader();
    lector.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setDatosExcel(data);
        setModalAbierto(true);
      } catch (err) {
        alert('Error al leer el archivo Excel.');
      } finally {
        setImportando(false);
      }
    };
    lector.readAsBinaryString(archivo);
  };

  const confirmarImportacionExcel = () => {
    if (datosExcel.length > 0) {
      const nuevosNuevos = datosExcel.map((row, idx) => ({
        id: row.id || row.ID || Date.now() + idx,
        cliente: row.cliente || row.Cliente || 'Cliente N/A',
        provincia: row.provincia || row.Provincia || 'Salta',
        localidad: row.localidad || row.Localidad || 'Salta',
        direccion: row.direccion || row.Direccion || 'Sin Dirección',
        bultos: Number(row.bultos || row.Bultos) || 1,
        kmDesdeCD: Number(row.kmDesdeCD || row.Km) || 50,
        estado_entrega: 'Pendiente'
      }));
      setPedidosBD([...pedidosBD, ...nuevosNuevos]);
      setModalAbierto(false);
      setDatosExcel([]);
      alert(`Se importaron ${nuevosNuevos.length} pedidos correctamente.`);
    }
  };

  // --- PROCESOS DE CIERRE Y ENTREGAS ---
  const confirmarCierrePedido = () => {
    if (!pedidoACerrar) return;
    setPedidosArchivadosRuta([...pedidosArchivadosRuta, pedidoACerrar.id]);
    setModalCierreAbierto(false);
    setPedidoACerrar(null);
    setObservacionEntrega('');
    alert('Pedido registrado con éxito.');
  };

  const finalizarJornadaViaje = () => {
    setModalCierreFinalViaje(true);
  };

  const confirmarFinalizacionTotalViaje = () => {
    setPedidosPorChofer({ ...pedidosPorChofer, [choferSeleccionado]: [] });
    setModalCierreFinalViaje(false);
    alert('Hoja de viaje finalizada. El vehículo vuelve a estar Disponible.');
  };

  // --- GESTIÓN DE PERSONAL Y FLOTA ---
  const agregarPersonal = (e) => {
    e.preventDefault();
    if (!nuevoNombrePersonal) return;
    setPersonalEmpresa([...personalEmpresa, { id: Date.now(), nombre: nuevoNombrePersonal, rol: nuevoRolPersonal, email: nuevoEmailPersonal, telefono: nuevoTelPersonal || 'Sin teléfono' }]);
    setNuevoNombrePersonal('');
    setNuevoEmailPersonal('');
    setNuevoTelPersonal('');
    alert('Personal agregado con éxito.');
  };

  const eliminarPersonal = (id) => setPersonalEmpresa(personalEmpresa.filter(p => p.id !== id));

  const agregarVehiculo = (e) => {
    e.preventDefault();
    if (!nuevoDominioVehiculo) return;
    setFlotaVehiculos([...flotaVehiculos, { dominio: nuevoDominioVehiculo.toUpperCase(), modelo: nuevoModeloVehiculo, km: Number(nuevoKmVehiculo) || 0, horas: Number(nuevasHorasVehiculo) || 0, tipoMedicion: tipoMedicionVehiculo, estado: 'Disponible' }]);
    setNuevoDominioVehiculo('');
    setNuevoModeloVehiculo('');
    setNuevoKmVehiculo('');
    setNuevasHorasVehiculo('');
    alert('Vehículo registrado.');
  };

  const eliminarVehiculo = (dom) => setFlotaVehiculos(flotaVehiculos.filter(v => v.dominio !== dom));
  const guardarVehiculoMantenimiento = async (e) => { e.preventDefault(); alert('Mantenimiento guardado.'); };
  const exportarMantenimientoExcel = () => alert('Exportando mantenimiento...');
  const exportarReporteExcel = () => alert('Exportando reporte...');

  const todosPedidosAsignadosIDs = Object.values(pedidosPorChofer).flat().map(p => p.id);
  const listaPedidosDisponibles = (pedidosBD.length > 0 ? pedidosBD : pedidosEjemplo).filter(p => !todosPedidosAsignadosIDs.includes(p.id));
  const nombresChoferesConRuta = Object.keys(pedidosPorChofer).filter(ch => (pedidosPorChofer[ch] || []).length > 0);
  const listaReportes = pedidosBD.length > 0 ? pedidosBD : pedidosEjemplo;

  const cerrarSesion = () => { window.location.href = '/login'; };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* HEADER SUPERIOR */}
      <div style={{ backgroundColor: '#064e3b', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{fechaFormateada}</span>
        <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 'bold' }}>Área Logística</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!esChofer && (
            <label style={{ backgroundColor: '#047857', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              📁 Importar Excel
              <input type="file" accept=".xlsx, .xls" onChange={manejarArchivoExcel} style={{ display: 'none' }} />
            </label>
          )}
          <button 
            onClick={limpiarHistorialRutas} 
            style={{ backgroundColor: '#b91c1c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🗑️ Borrar Historial de Viajes
          </button>
          <button onClick={cerrarSesion} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* NAVEGACIÓN PESTAÑAS */}
        {!esChofer && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button onClick={() => setPestanaActiva('gestion')} style={{ backgroundColor: pestanaActiva === 'gestion' ? '#1e293b' : '#64748b', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🗺️ Rutas</button>
            <button onClick={() => setPestanaActiva('reportes')} style={{ backgroundColor: pestanaActiva === 'reportes' ? '#1e293b' : '#64748b', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📊 Reportes</button>
            <button onClick={() => setPestanaActiva('flotaPersonal')} style={{ backgroundColor: pestanaActiva === 'flotaPersonal' ? '#1e293b' : '#64748b', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚚 Flota y Personal</button>
            <button onClick={() => setPestanaActiva('mantenimientoFlota')} style={{ backgroundColor: pestanaActiva === 'mantenimientoFlota' ? '#1e293b' : '#b45309', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🛠️ Mantenimiento</button>
          </div>
        )}

        {/* PESTAÑA RUTAS */}
        {pestanaActiva === 'gestion' && (
          <TabRutas 
            esChofer={esChofer}
            choferSeleccionado={choferSeleccionado}
            setChoferSeleccionado={setChoferSeleccionado}
            vehiculoSeleccionado={vehiculoSeleccionado}
            setVehiculoSeleccionado={setVehiculoSeleccionado}
            vehiculoPorChofer={vehiculoPorChofer}
            listaChoferes={listaChoferes}
            flotaVehiculos={flotaVehiculos}
            pedidosPorChofer={pedidosPorChofer}
            pedidosSeleccionadosCheckbox={pedidosSeleccionadosCheckbox}
            toggleSeleccionPedidoCheckbox={toggleSeleccionPedidoCheckbox}
            agregarPedidosSeleccionadosARuta={agregarPedidosSeleccionadosARuta}
            quitarPedidoDeChofer={quitarPedidoDeChofer}
            optimizarRutaOrdenada={optimizarRutaOrdenada}
            optimizarRutaEspecificaChofer={optimizarRutaEspecificaChofer}
            enviarRutaWhatsApp={enviarRutaWhatsApp}
            enviarRutaWhatsAppEspecifico={enviarRutaWhatsAppEspecifico}
            kmTotalRuta={kmTotalRuta}
            pedidosArchivadosRuta={pedidosArchivadosRuta}
            setPedidosArchivadosRuta={setPedidosArchivadosRuta}
            listaPedidosDisponibles={listaPedidosDisponibles}
            nombresChoferesConRuta={nombresChoferesConRuta}
            setModalCierreAbierto={setModalCierreAbierto}
            setPedidoACerrar={setPedidoACerrar}
            setModalCierreFinalViaje={setModalCierreFinalViaje}
            fechaFormateada={fechaFormateada}
          />
        )}

        {/* PESTAÑA REPORTES */}
        {pestanaActiva === 'reportes' && !esChofer && (
          <TabPedidos listaReportes={listaReportes} exportarReporteExcel={exportarReporteExcel} />
        )}

        {/* PESTAÑA FLOTA Y PERSONAL */}
        {pestanaActiva === 'flotaPersonal' && !esChofer && (
          <TabFlota 
            personalEmpresa={personalEmpresa}
            flotaVehiculos={flotaVehiculos}
            nuevoNombrePersonal={nuevoNombrePersonal}
            setNuevoNombrePersonal={setNuevoNombrePersonal}
            nuevoRolPersonal={nuevoRolPersonal}
            setNuevoRolPersonal={setNuevoRolPersonal}
            nuevoEmailPersonal={nuevoEmailPersonal}
            setNuevoEmailPersonal={setNuevoEmailPersonal}
            nuevoTelPersonal={nuevoTelPersonal}
            setNuevoTelPersonal={setNuevoTelPersonal}
            agregarPersonal={agregarPersonal}
            eliminarPersonal={eliminarPersonal}
            nuevoDominioVehiculo={nuevoDominioVehiculo}
            setNuevoDominioVehiculo={setNuevoDominioVehiculo}
            nuevoModeloVehiculo={nuevoModeloVehiculo}
            setNuevoModeloVehiculo={setNuevoModeloVehiculo}
            nuevoKmVehiculo={nuevoKmVehiculo}
            setNuevoKmVehiculo={setNuevoKmVehiculo}
            tipoMedicionVehiculo={tipoMedicionVehiculo}
            setTipoMedicionVehiculo={setTipoMedicionVehiculo}
            nuevasHorasVehiculo={nuevasHorasVehiculo}
            setNuevasHorasVehiculo={setNuevasHorasVehiculo}
            agregarVehiculo={agregarVehiculo}
            eliminarVehiculo={eliminarVehiculo}
          />
        )}

        {/* PESTAÑA MANTENIMIENTO */}
        {pestanaActiva === 'mantenimientoFlota' && !esChofer && (
          <TabCostos 
            listaTodasPatentes={listaTodasPatentes}
            flotaMantenimientoFiltrada={flotaMantenimientoBD}
            nuevaPatenteMto={nuevaPatenteMto}
            setNuevaPatenteMto={setNuevaPatenteMto}
            nuevoModeloMto={nuevoModeloMto}
            setNuevoModeloMto={setNuevoModeloMto}
            nuevoKmActualMto={nuevoKmActualMto}
            setNuevoKmActualMto={setNuevoKmActualMto}
            nuevaFrecuenciaMto={nuevaFrecuenciaMto}
            setNuevaFrecuenciaMto={setNuevaFrecuenciaMto}
            nuevoUltimoMtoKm={nuevoUltimoMtoKm}
            setNuevoUltimoMtoKm={setNuevoUltimoMtoKm}
            nuevoCostoMto={nuevoCostoMto}
            setNuevoCostoMto={setNuevoCostoMto}
            guardarVehiculoMantenimiento={guardarVehiculoMantenimiento}
            filtroPatenteMto={filtroPatenteMto}
            setFiltroPatenteMto={setFiltroPatenteMto}
            exportarMantenimientoExcel={exportarMantenimientoExcel}
            flotaVehiculos={flotaVehiculos}
            flotaMantenimientoBD={flotaMantenimientoBD}
          />
        )}
      </div>

      {/* MODAL CONFIRMACIÓN IMPORTACIÓN EXCEL */}
      {modalAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>📄 Confirmar Importación</h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Se han encontrado {datosExcel.length} filas en el archivo. ¿Deseas incorporarlas a los pedidos del día?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setModalAbierto(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmarImportacionExcel} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#047857', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar e Importar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO DE ENTREGA / RECHAZO INDIVIDUAL */}
      {modalCierreAbierto && pedidoACerrar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>📦 Registrar Estado de Entrega</h3>
            <p style={{ fontSize: '13px', color: '#475569' }}>Pedido <strong>#{pedidoACerrar.id}</strong> - {pedidoACerrar.cliente}</p>
            
            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Estado:</label>
              <select value={estadoEntrega} onChange={(e) => setEstadoEntrega(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="Entregado">Entregado</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Ausente">Cliente Ausente</option>
              </select>
            </div>

            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Observaciones / Comprobante:</label>
              <textarea value={observacionEntrega} onChange={(e) => setObservacionEntrega(e.target.value)} placeholder="Ej. Recibió firma en remito Nº..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '60px' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setModalCierreAbierto(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmarCierrePedido} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#0284c7', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Estado</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CIERRE FINAL DE VIAJE DE CHOFER */}
      {modalCierreFinalViaje && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>🏁 Finalizar Hoja de Ruta</h3>
            <p style={{ fontSize: '13px', color: '#475569' }}>¿Confirmas la finalización completa del viaje para <strong>{choferSeleccionado}</strong>? El vehículo asignado volverá a estar libre y disponible.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setModalCierreFinalViaje(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmarFinalizacionTotalViaje} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#047857', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Finalizar Hoja de Ruta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}