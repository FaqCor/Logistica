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

  // Estado local para ocultar entregados en la vista de rutas
  const [pedidosArchivadosRuta, setPedidosArchivadosRuta] = useState([]);

  // --- ESTADOS PARA MANTENIMIENTO DE FLOTA ---
  const [flotaMantenimientoBD, setFlotaMantenimientoBD] = useState([]);
  const [nuevaPatenteMto, setNuevaPatenteMto] = useState('');
  const [nuevoModeloMto, setNuevoModeloMto] = useState('');
  const [nuevoKmActualMto, setNuevoKmActualMto] = useState('');
  const [nuevaFrecuenciaMto, setNuevaFrecuenciaMto] = useState('15000');
  const [nuevoUltimoMtoKm, setNuevoUltimoMtoKm] = useState('');
  const [nuevoTipoMto, setNuevoTipoMto] = useState('Service completo de aceite y filtros');

  // --- ESTADOS PARA PERSONAL Y VEHÍCULOS (FLOTA) ---
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
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(flotaVehiculos[0]?.dominio || 'NEB732');

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

  // --- REGISTRAR Y ELIMINAR PERSONAL ---
  const agregarPersonal = (e) => {
    e.preventDefault();
    if (!nuevoNombrePersonal) {
      alert('Por favor, ingresa el nombre del personal.');
      return;
    }

    const nuevoEmpleado = {
      id: Date.now(),
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

  const eliminarPersonal = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar a este integrante del plantel?')) {
      setPersonalEmpresa(personalEmpresa.filter(p => p.id !== id));
    }
  };

  // --- REGISTRAR, ELIMINAR Y VINCULAR VEHÍCULOS CON MANTENIMIENTO ---
  const agregarVehiculo = async (e) => {
    e.preventDefault();
    if (!nuevoDominioVehiculo || !nuevoModeloVehiculo) {
      alert('Por favor, ingresa la patente (dominio) y el modelo.');
      return;
    }

    const patenteUpper = nuevoDominioVehiculo.toUpperCase();
    const kmVal = parseFloat(nuevoKmVehiculo) || 0;

    const nuevoVeh = {
      dominio: patenteUpper,
      modelo: nuevoModeloVehiculo,
      km: kmVal,
      estado: 'Disponible',
      enMantenimiento: false
    };

    const existeLocal = flotaVehiculos.some(v => v.dominio === patenteUpper);
    if (existeLocal) {
      setFlotaVehiculos(flotaVehiculos.map(v => v.dominio === patenteUpper ? nuevoVeh : v));
    } else {
      setFlotaVehiculos([...flotaVehiculos, nuevoVeh]);
    }

    try {
      await fetch('/api/flota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patente: patenteUpper,
          modelo: nuevoModeloVehiculo,
          kmActual: kmVal,
          frecuencia: 15000,
          ultimoKm: 0,
          tipoMantenimiento: 'Service completo de aceite y filtros'
        })
      });
      cargarDatosBD();
    } catch (err) {
      console.warn('No se pudo vincular directamente con la BD de mantenimiento.');
    }

    setNuevoDominioVehiculo('');
    setNuevoModeloVehiculo('');
    setNuevoKmVehiculo('');
    alert(`¡Vehículo patente ${patenteUpper} registrado y vinculado a Mantenimiento!`);
  };

  const eliminarVehiculo = (dominio) => {
    if (confirm(`¿Deseas eliminar el vehículo patente ${dominio} de la flota?`)) {
      setFlotaVehiculos(flotaVehiculos.filter(v => v.dominio !== dominio));
    }
  };

  // Guardar o actualizar mantenimiento directo desde pestaña Mantenimiento
  const guardarVehiculoMantenimiento = async (e) => {
    e.preventDefault();
    if (!nuevaPatenteMto || !nuevoKmActualMto) {
      alert('Por favor, ingresa la patente y el kilómetro actual.');
      return;
    }

    try {
      const res = await fetch('/api/flota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patente: nuevaPatenteMto,
          modelo: nuevoModeloMto || 'Vehículo General',
          kmActual: nuevoKmActualMto,
          frecuencia: nuevaFrecuenciaMto,
          ultimoKm: nuevoUltimoMtoKm || 0,
          tipoMantenimiento: nuevoTipoMto
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setNuevaPatenteMto('');
        setNuevoModeloMto('');
        setNuevoKmActualMto('');
        setNuevoUltimoMtoKm('');
        cargarDatosBD();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al conectar con el servidor.');
    }
  };

  // Cargar pedidos y flota desde la BD
  const cargarDatosBD = async () => {
    try {
      const res = await fetch('/api/pedidos', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.pedidos)) {
          setPedidosBD(data.pedidos);
        }
      }

      const resFlota = await fetch('/api/flota', { cache: 'no-store' });
      if (resFlota.ok) {
        const dataFlota = await resFlota.json();
        if (dataFlota.success && Array.isArray(dataFlota.flota)) {
          setFlotaMantenimientoBD(dataFlota.flota);
        }
      }
    } catch (err) {
      console.warn('Utilizando datos locales o cargados previamente.');
    }
  };

  useEffect(() => {
    cargarDatosBD();
  }, []);

  useEffect(() => {
    if (!esChofer) {
      cargarDatosBD();
      const interval = setInterval(() => {
        cargarDatosBD();
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
        setPedidosArchivadosRuta([]);
        cargarDatosBD();
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

  // --- OPTIMIZAR RUTA Y ENVIAR POR WHATSAPP ---
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

  const enviarRutaWhatsApp = () => {
    const listaAEnviar = pedidosAsignados.length > 0 ? pedidosAsignados : (pedidosBD.length > 0 ? pedidosBD : pedidosEjemplo);
    if (listaAEnviar.length === 0) {
      alert('No hay pedidos asignados en la ruta para enviar.');
      return;
    }

    let mensaje = `🚛 *HOJA DE RUTA ASIGNADA*\n`;
    mensaje += `*Chofer:* ${choferSeleccionado}\n`;
    mensaje += `*Vehículo:* ${vehiculoSeleccionado}\n`;
    mensaje += `*Fecha:* ${fechaFormateada}\n`;
    mensaje += `*Recorrido Estimado:* ${kmTotalRuta || 830} KM\n\n`;
    mensaje += `📍 *PARADAS Y PEDIDOS:*\n`;

    listaAEnviar.forEach((p, index) => {
      mensaje += `\n*${index + 1}. Pedido #${p.id}* - ${p.cliente || p.Cliente}\n`;
      mensaje += `📍 Dirección: ${p.direccion || p.Direccion} (${p.provincia || 'Salta'})\n`;
      mensaje += `📦 Bultos: ${p.bultos || 1}\n`;
    });

    const choferObj = personalEmpresa.find(p => p.nombre === choferSeleccionado);
    const telefonoChofer = choferObj?.telefono ? choferObj.telefono.replace(/\D/g, '') : '3874556677';

    const url = `https://wa.me/549${telefonoChofer}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
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

      const vehiculoEnUso = flotaMantenimientoBD.find(v => v.patente === vehiculoSeleccionado);
      if (vehiculoEnUso) {
        const nuevoKmActual = Number(vehiculoEnUso.km_actual || 0) + Number(kmPedido);
        await fetch('/api/flota', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patente: vehiculoEnUso.patente,
            modelo: vehiculoEnUso.modelo,
            kmActual: nuevoKmActual,
            frecuencia: vehiculoEnUso.frecuencia_mantenimiento,
            ultimoKm: vehiculoEnUso.ultimo_mantenimiento_km,
            tipoMantenimiento: vehiculoEnUso.tipo_mantenimiento
          })
        });
      }

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
    
    cargarDatosBD();
  };

  const confirmarCierreFinalViaje = async () => {
    if (!kmFinalViajeSalta) {
      alert('Ingresa el kilometraje final del vehículo al momento del regreso.');
      return;
    }

    try {
      const vehiculoEnUso = flotaMantenimientoBD.find(v => v.patente === vehiculoSeleccionado);
      if (vehiculoEnUso) {
        await fetch('/api/flota', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patente: vehiculoEnUso.patente,
            modelo: vehiculoEnUso.modelo,
            kmActual: kmFinalViajeSalta,
            frecuencia: vehiculoEnUso.frecuencia_mantenimiento,
            ultimoKm: vehiculoEnUso.ultimo_mantenimiento_km,
            tipoMantenimiento: vehiculoEnUso.tipo_mantenimiento
          })
        });
      }
    } catch (err) {
      console.warn('No se pudo actualizar el km final en flota.');
    }

    alert(`¡Viaje finalizado con éxito!\nKilometraje final del vehículo registrado: ${kmFinalViajeSalta} km.`);
    setModalCierreFinalViaje(false);
    setKmFinalViajeSalta('');
    cargarDatosBD();
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
      
      {/* HEADER VERDE OSCURO CON ÁREA LOGÍSTICA CENTRADO */}
      <div style={{ 
        backgroundColor: '#064e3b', 
        color: '#fff', 
        padding: '14px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Lado izquierdo: Fecha */}
        <div>
          <span style={{ fontSize: '13px', color: '#a7f3d0', fontWeight: '500' }}>
            {fechaFormateada}
          </span>
        </div>

        {/* Centro: Área Logística */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px' }}>
            Área Logística
          </h1>
        </div>

        {/* Lado derecho: Placa de vehículo y botón salir */}
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
        
        {/* TÍTULO Y BOTONERA DE NAVEGACIÓN */}
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
                onClick={() => { setPestanaActiva('gestion'); cargarDatosBD(); }}
                style={{ backgroundColor: pestanaActiva === 'gestion' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                🗺️ Rutas y Asignación
              </button>
              <button 
                onClick={() => { setPestanaActiva('reportes'); cargarDatosBD(); }}
                style={{ backgroundColor: pestanaActiva === 'reportes' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                📊 Reportes y Exportación
              </button>

              <button 
                onClick={() => setPestanaActiva('flotaPersonal')}
                style={{ backgroundColor: pestanaActiva === 'flotaPersonal' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                🚚 Flota y Personal
              </button>

              <button 
                onClick={() => setPestanaActiva('mantenimientoFlota')}
                style={{ backgroundColor: pestanaActiva === 'mantenimientoFlota' ? '#1e293b' : '#b45309', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                🛠️ Mantenimiento de Flota
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

              <button 
                type="submit" 
                disabled={enviandoChecklist}
                style={{ width: '100%', padding: '14px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
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
                          {v.dominio} - {v.modelo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ backgroundColor: '#0f172a', color: '#ffffff', fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 'bold', padding: '5px 10px', borderRadius: '6px' }}>
                    {vehiculoSeleccionado}
                  </span>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
                      {esChofer ? 'Juan Pérez' : choferSeleccionado}
                    </h2>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Transporte Asignado</span>
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
                </div>
              </div>

              {/* CAJA DE RECORRIDO ESTIMADO Y KILOMETRAJE DE LA RUTA */}
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
                          
                          <a 
                            href={`tel:${telefonoCliente}`} 
                            title={`Llamar (${telefonoCliente})`}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '50%', textDecoration: 'none', fontSize: '14px' }}
                          >
                            📞
                          </a>

                          {!esChofer && (
                            <button 
                              onClick={() => {
                                if (confirm(`¿Deseas quitar el pedido #${p.id} de la ruta activa?`)) {
                                  setPedidosArchivadosRuta([...pedidosArchivadosRuta, p.id]);
                                }
                              }}
                              title="Quitar pedido"
                              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '14px' }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>

                        📍 Dirección: <strong>{p.direccion || p.Direccion}</strong> | 📦 Bultos: <strong>{p.bultos || 1}</strong>
                        <br/>Estado: <strong style={{ 
                          color: p.estado_entrega === 'Entregado' ? '#166534' : '#854d0e',
                          backgroundColor: p.estado_entrega === 'Entregado' ? '#dcfce7' : '#fef9c3',
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

              {/* BOTONES DE OPTIMIZAR RUTA Y ENVIAR POR WHATSAPP */}
              {!esChofer && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
                  <button onClick={optimizarRutaOrdenada} style={{ padding: '10px 20px', backgroundColor: '#facc15', color: '#713f12', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    ⚡ Optimizar Ruta y Calcular KM Totales
                  </button>
                  <button onClick={enviarRutaWhatsApp} style={{ padding: '10px 20px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    📲 Enviar Ruta por WhatsApp
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
                          backgroundColor: p.estado_entrega === 'Entregado' ? '#dcfce7' : '#fef9c3',
                          color: p.estado_entrega === 'Entregado' ? '#166534' : '#854d0e'
                        }}>
                          {p.estado_entrega || 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#15803d' }}>${p.monto_total_cobrado || 0}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#fff5f5', color: '#b91c1c' }}>${p.gasto_total || 0}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#f0f9ff', color: '#0369a1' }}>{p.km_recorridos_pedido || p.kmDesdeCD || 0} KM</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: FLOTA Y PERSONAL COMPLETA */}
        {pestanaActiva === 'flotaPersonal' && !esChofer && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              🏢 Administración de Flota y Personal (Choferes y Ayudantes)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              
              {/* Formulario Personal */}
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

              {/* Formulario Vehículo */}
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#064e3b', fontSize: '16px' }}>🚛 Registrar / Modificar Vehículo (Flota)</h4>
                <form onSubmit={agregarVehiculo}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Patente / Dominio:</label>
                    <input 
                      type="text" 
                      placeholder="Ej: NEB732" 
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
                      placeholder="Ej: IVECO Daily" 
                      value={nuevoModeloVehiculo} 
                      onChange={(e) => setNuevoModeloVehiculo(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Kilometraje Actual:</label>
                    <input 
                      type="number" 
                      placeholder="124500" 
                      value={nuevoKmVehiculo} 
                      onChange={(e) => setNuevoKmVehiculo(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Guardar y Vincular a Mantenimiento
                  </button>
                </form>
              </div>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* Tabla Personal */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>👥 Plantel Registrado (Choferes y Ayudantes)</h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '8px' }}>Nombre</th>
                        <th style={{ padding: '8px' }}>Rol</th>
                        <th style={{ padding: '8px' }}>Contacto</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Acción</th>
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
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <button 
                              onClick={() => eliminarPersonal(p.id)}
                              title="Eliminar del plantel"
                              style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabla Vehículos */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>🚛 Vehículos Activos de la Flota</h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '8px' }}>Patente</th>
                        <th style={{ padding: '8px' }}>Modelo</th>
                        <th style={{ padding: '8px' }}>Km Actual</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flotaVehiculos.map((v, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', fontWeight: 'bold', fontFamily: 'monospace' }}>{v.dominio}</td>
                          <td style={{ padding: '8px' }}>{v.modelo}</td>
                          <td style={{ padding: '8px', color: '#0284c7', fontWeight: 'bold' }}>{v.km} km</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <button 
                              onClick={() => {
                                setNuevoDominioVehiculo(v.dominio);
                                setNuevoModeloVehiculo(v.modelo);
                                setNuevoKmVehiculo(v.km);
                              }}
                              title="Cargar datos en el formulario para modificar"
                              style={{ backgroundColor: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginRight: '4px' }}
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => eliminarVehiculo(v.dominio)}
                              title="Eliminar vehículo de la flota"
                              style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* PESTAÑA 4: MANTENIMIENTO DE FLOTA Y ALERTAS */}
        {pestanaActiva === 'mantenimientoFlota' && !esChofer && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              🛠️ Control de Mantenimiento Preventivo de Flota
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Monitoreo automático de kilometrajes anteriores, actuales y alertas cuando falten 2.500 km o menos para el service.
            </p>

            {/* Formulario Mantenimiento */}
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#b45309', fontSize: '16px' }}>📝 Registrar / Actualizar Kilometraje o Service</h4>
              <form onSubmit={guardarVehiculoMantenimiento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Patente / Dominio:</label>
                  <input 
                    type="text" 
                    placeholder="Ej: NEB732" 
                    value={nuevaPatenteMto} 
                    onChange={(e) => setNuevaPatenteMto(e.target.value.toUpperCase())} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Modelo del Vehículo:</label>
                  <input 
                    type="text" 
                    placeholder="Ej: IVECO Daily" 
                    value={nuevoModeloMto} 
                    onChange={(e) => setNuevoModeloMto(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Km Actual:</label>
                  <input 
                    type="number" 
                    placeholder="Ej: 124500" 
                    value={nuevoKmActualMto} 
                    onChange={(e) => setNuevoKmActualMto(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Frecuencia Mto (Km):</label>
                  <input 
                    type="number" 
                    value={nuevaFrecuenciaMto} 
                    onChange={(e) => setNuevaFrecuenciaMto(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Km Último Service:</label>
                  <input 
                    type="number" 
                    placeholder="Ej: 115000" 
                    value={nuevoUltimoMtoKm} 
                    onChange={(e) => setNuevoUltimoMtoKm(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Tipo de Mantenimiento:</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Service de aceite y filtros" 
                    value={nuevoTipoMto} 
                    onChange={(e) => setNuevoTipoMto(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#b45309', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Guardar / Actualizar
                  </button>
                </div>
              </form>
            </div>

            {/* Tabla Mantenimiento */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                    <th style={{ padding: '10px' }}>Patente</th>
                    <th style={{ padding: '10px' }}>Modelo</th>
                    <th style={{ padding: '10px' }}>Km Anterior</th>
                    <th style={{ padding: '10px' }}>Km Actual</th>
                    <th style={{ padding: '10px' }}>Próximo Service (Km)</th>
                    <th style={{ padding: '10px' }}>Mantenimiento a Realizar</th>
                    <th style={{ padding: '10px' }}>Estado / Alerta</th>
                  </tr>
                </thead>
                <tbody>
                  {flotaMantenimientoBD.map((v, idx) => {
                    const kmActual = Number(v.km_actual || 0);
                    const ultimoMto = Number(v.ultimo_mantenimiento_km || 0);
                    const frecuencia = Number(v.frecuencia_mantenimiento || 15000);
                    const proximoServiceKm = ultimoMto + frecuencia;
                    const kmRestantes = proximoServiceKm - kmActual;
                    
                    const enAlerta = kmRestantes <= 2500;
                    const vencido = kmRestantes <= 0;

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: vencido ? '#fee2e2' : enAlerta ? '#fef9c3' : '#fff' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>{v.patente}</td>
                        <td style={{ padding: '10px' }}>{v.modelo}</td>
                        <td style={{ padding: '10px', color: '#64748b' }}>{v.km_anterior || 0} km</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#0284c7' }}>{kmActual} km</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{proximoServiceKm} km</td>
                        <td style={{ padding: '10px' }}>{v.tipo_mantenimiento || 'Mantenimiento General'}</td>
                        <td style={{ padding: '10px' }}>
                          {vencido ? (
                            <span style={{ backgroundColor: '#b91c1c', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                              ⚠️ ¡MANTENIMIENTO VENCIDO!
                            </span>
                          ) : enAlerta ? (
                            <span style={{ backgroundColor: '#ca8a04', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                              🚨 ALERTA: Faltan {kmRestantes} km
                            </span>
                          ) : (
                            <span style={{ backgroundColor: '#166534', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                              ✅ En Vigencia (Faltan {kmRestantes} km)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
              <option value="Pendiente">Pendiente</option>
              <option value="No entregado">No entregado</option>
            </select>

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
              Ingresa el kilometraje final del vehículo. Esto actualizará automáticamente el acumulado de la flota.
            </p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>
              Kilometraje Final (KM):
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
              <button onClick={confirmarCierreFinalViaje} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#064e3b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Finalizar y Actualizar Km</button>
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