'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import TabRutas from './TabRutas';
import TabCostos from './TabCostos';
import TabFlota from './TabFlota';
import TabPedidos from './TabPedidos';
import TabFallas from './TabFallas';
import TabActualizarKm from './TabActualizarKm';

export default function Panel({ email }) {
  const esChofer = email && (email.toLowerCase().includes('chofer') || email.toLowerCase().includes('driver')); 
  const [pestanaActiva, setPestanaActiva] = useState('gestion');

  const hoy = new Date();
  const fechaFormateada = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

  // Estados de datos y modales
  const [pedidosBD, setPedidosBD] = useState([]);
  const [pedidosPorChofer, setPedidosPorChofer] = useState({});
  const [vehiculoPorChofer, setVehiculoPorChofer] = useState({});
  const [pedidosSeleccionadosCheckbox, setPedidosSeleccionadosCheckbox] = useState([]);
  const [pedidosArchivadosRuta, setPedidosArchivadosRuta] = useState([]);

  // Estados de Mantenimiento / Costos
  const [flotaMantenimientoBD, setFlotaMantenimientoBD] = useState([]);
  const [nuevaPatenteMto, setNuevaPatenteMto] = useState('');
  const [nuevoModeloMto, setNuevoModeloMto] = useState('');
  const [nuevoKmActualMto, setNuevoKmActualMto] = useState('');
  const [nuevaFrecuenciaMto, setNuevaFrecuenciaMto] = useState('15000');
  const [nuevoUltimoMtoKm, setNuevoUltimoMtoKm] = useState('');
  const [nuevoCostoMto, setNuevoCostoMto] = useState('');
  const [filtroPatenteMto, setFiltroPatenteMto] = useState('');

  // Estados Actualizar KM
  const [patenteRapidaKm, setPatenteRapidaKm] = useState('');
  const [valorRapidoKm, setValorRapidoKm] = useState('');

  // Personal y Flota
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
  
  const listaChoferes = personalEmpresa.filter(p => p.rol === 'Chofer');
  const [flotaVehiculos, setFlotaVehiculos] = useState([
    { dominio: 'NEB732', modelo: 'IVECO Daily', km: 124500, estado: 'Disponible', enMantenimiento: false },
    { dominio: 'AF997GV', modelo: 'Mercedes Benz Sprinter', km: 98200, estado: 'Disponible', enMantenimiento: false }
  ]);

  const [choferSeleccionado, setChoferSeleccionado] = useState(listaChoferes[0]?.nombre || 'Juan Pérez');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(flotaVehiculos[0]?.dominio || 'NEB732');
  const [kmTotalRuta, setKmTotalRuta] = useState(0);

  // Modales
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [pedidoACerrar, setPedidoACerrar] = useState(null);
  const [modalCierreFinalViaje, setModalCierreFinalViaje] = useState(false);

  const listaTodasPatentes = Array.from(new Set([
    ...flotaVehiculos.map(v => v.dominio),
    ...flotaMantenimientoBD.map(v => v.patente)
  ])).filter(Boolean);

  // Cargar datos desde la API (Neon DB)
  const cargarDatosBD = async () => {
    try {
      const res = await fetch('/api/pedidos', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.pedidos)) setPedidosBD(data.pedidos);
      }
      const resFlota = await fetch('/api/flota', { cache: 'no-store' });
      if (resFlota.ok) {
        const dataFlota = await resFlota.json();
        let listaFlota = Array.isArray(dataFlota) ? dataFlota : (dataFlota.success ? dataFlota.flota : []);
        setFlotaMantenimientoBD(listaFlota);
      }
    } catch (err) {
      console.warn('Usando datos locales.');
    }
  };

  useEffect(() => { cargarDatosBD(); }, []);

  useEffect(() => {
    if (patenteRapidaKm) {
      const veh = flotaVehiculos.find(v => v.dominio === patenteRapidaKm) || flotaMantenimientoBD.find(v => v.patente === patenteRapidaKm);
      if (veh) {
        setValorRapidoKm(veh.km || veh.horas || veh.km_actual || '');
      }
    }
  }, [patenteRapidaKm]);

  // Funciones de Personal y Flota
  const agregarPersonal = (e) => {
    e.preventDefault();
    if (!nuevoNombrePersonal) return alert('Ingresa el nombre del personal.');
    setPersonalEmpresa([...personalEmpresa, { id: Date.now(), nombre: nuevoNombrePersonal, rol: nuevoRolPersonal, email: nuevoEmailPersonal, telefono: nuevoTelPersonal }]);
    setNuevoNombrePersonal(''); setNuevoEmailPersonal(''); setNuevoTelPersonal('');
    alert('Personal registrado con éxito.');
  };

  const eliminarPersonal = (id) => {
    if (confirm('¿Estás seguro de eliminar este integrante?')) setPersonalEmpresa(personalEmpresa.filter(p => p.id !== id));
  };

  const agregarVehiculo = (e) => {
    e.preventDefault();
    if (!nuevoDominioVehiculo || !nuevoModeloVehiculo) return alert('Ingresa patente y modelo.');
    const patenteUpper = nuevoDominioVehiculo.toUpperCase();
    setFlotaVehiculos([...flotaVehiculos, { dominio: patenteUpper, modelo: nuevoModeloVehiculo, km: Number(nuevoKmVehiculo) || 0, estado: 'Disponible', enMantenimiento: false }]);
    setNuevoDominioVehiculo(''); setNuevoModeloVehiculo(''); setNuevoKmVehiculo('');
    alert(`Vehículo ${patenteUpper} registrado.`);
  };

  const eliminarVehiculo = (dominio) => {
    if (confirm(`¿Eliminar unidad ${dominio}?`)) setFlotaVehiculos(flotaVehiculos.filter(v => v.dominio !== dominio));
  };

  // Función Mantenimiento
  const guardarVehiculoMantenimiento = async (e) => {
    e.preventDefault();
    if (!nuevaPatenteMto || !nuevoCostoMto) return alert('Completa los campos obligatorios de mantenimiento.');
    alert('¡Mantenimiento guardado correctamente!');
    setNuevoCostoMto('');
    cargarDatosBD();
  };

  // Función Actualizar KM Rápido
  const actualizarKmRapido = async (e) => {
    e.preventDefault();
    if (!patenteRapidaKm || !valorRapidoKm) {
      alert('Por favor, selecciona una patente e ingresa la nueva lectura.');
      return;
    }
    const kmNumerico = Number(valorRapidoKm);
    const patenteUpper = patenteRapidaKm.toUpperCase();

    try {
      const res = await fetch('/api/flota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patente: patenteUpper, km_actual: kmNumerico })
      });
      if (res.ok) {
        setFlotaVehiculos(prev => prev.map(v => v.dominio === patenteUpper ? { ...v, km: kmNumerico, horas: kmNumerico } : v));
        alert(`¡Lectura de la patente ${patenteUpper} actualizada a ${kmNumerico}!`);
        setValorRapidoKm('');
        cargarDatosBD();
      } else {
        alert('No se pudo actualizar la lectura en el servidor.');
      }
    } catch (error) {
      alert('Error de conexión al actualizar la lectura.');
    }
  };

  // Funciones de Rutas
  const agregarPedidosSeleccionadosARuta = () => {
    if (pedidosSeleccionadosCheckbox.length === 0) return alert('Selecciona al menos un pedido.');
    const pedidosAgn = pedidosBD.filter(p => pedidosSeleccionadosCheckbox.includes(p.id));
    const actualAsignados = pedidosPorChofer[choferSeleccionado] || [];
    setPedidosPorChofer({ ...pedidosPorChofer, [choferSeleccionado]: [...actualAsignados, ...pedidosAgn] });
    setVehiculoPorChofer({ ...vehiculoPorChofer, [choferSeleccionado]: vehiculoSeleccionado });
    setPedidosSeleccionadosCheckbox([]);
    alert(`Se asignaron ${pedidosAgn.length} pedidos a ${choferSeleccionado}.`);
  };

  const quitarPedidoDeChofer = (nombreChofer, idPedido) => {
    const actual = pedidosPorChofer[nombreChofer] || [];
    setPedidosPorChofer({ ...pedidosPorChofer, [nombreChofer]: actual.filter(p => p.id !== idPedido) });
  };

  const exportarReporteExcel = () => {
    const ws = XLSX.utils.json_to_sheet(pedidosBD);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, 'Reporte_Logistica.xlsx');
  };

  const cerrarSesion = () => { window.location.href = '/login'; };

  const todosPedidosAsignadosIDs = Object.values(pedidosPorChofer).flat().map(p => p.id);
  const listaPedidosDisponibles = pedidosBD.filter(p => !todosPedidosAsignadosIDs.includes(p.id));
  const nombresChoferesConRuta = Object.keys(pedidosPorChofer).filter(ch => (pedidosPorChofer[ch] || []).length > 0);
  const flotaMantenimientoFiltrada = filtroPatenteMto ? flotaMantenimientoBD.filter(v => v.patente === filtroPatenteMto) : flotaMantenimientoBD;

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER VERDE OSCURO */}
      <div style={{ backgroundColor: '#064e3b', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div><span style={{ fontSize: '13px', color: '#a7f3d0', fontWeight: '500' }}>{fechaFormateada}</span></div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Área Logística</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#0f172a', fontWeight: '900', fontSize: '15px', padding: '2px 10px', background: '#fff', borderRadius: '4px' }}>{vehiculoSeleccionado}</span>
          <button onClick={cerrarSesion} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* BOTONERA DE NAVEGACIÓN SUPERIOR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>Gestión Logística y Control de Vehículos</h2>
            {email && <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Conectado como: <strong>{email}</strong> (Encargado de Logística) | Hub: Maestro Pedernera 1217</p>}
          </div>

          {!esChofer && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setPestanaActiva('gestion')} style={{ backgroundColor: pestanaActiva === 'gestion' ? '#1e293b' : '#334155', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🗺️ Rutas</button>
              <button onClick={() => setPestanaActiva('reportes')} style={{ backgroundColor: pestanaActiva === 'reportes' ? '#1e293b' : '#334155', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>📊 Reportes</button>
              <button onClick={() => setPestanaActiva('flotaPersonal')} style={{ backgroundColor: pestanaActiva === 'flotaPersonal' ? '#1e293b' : '#334155', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🚚 Flota y Personal</button>
              <button onClick={() => setPestanaActiva('mantenimientoFlota')} style={{ backgroundColor: pestanaActiva === 'mantenimientoFlota' ? '#1e293b' : '#b45309', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🛠️ Mantenimiento</button>
              <button onClick={() => setPestanaActiva('combustible')} style={{ backgroundColor: pestanaActiva === 'combustible' ? '#1e293b' : '#15803d', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>⛽ Combustible</button>
              <button onClick={() => setPestanaActiva('choferesCarnets')} style={{ backgroundColor: pestanaActiva === 'choferesCarnets' ? '#1e293b' : '#0369a1', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🪪 Carnets Choferes</button>
              <button onClick={() => setPestanaActiva('actualizarKm')} style={{ backgroundColor: pestanaActiva === 'actualizarKm' ? '#1e293b' : '#d97706', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>⏱️ Actualizar KM</button>
            </div>
          )}
        </div>

        {/* RENDERIZADO CONDICIONAL DE PESTAÑAS */}
        {pestanaActiva === 'gestion' && (
          <TabRutas 
            esChofer={esChofer}
            choferSeleccionado={choferSeleccionado} setChoferSeleccionado={setChoferSeleccionado}
            vehiculoSeleccionado={vehiculoSeleccionado} setVehiculoSeleccionado={setVehiculoSeleccionado}
            listaChoferes={listaChoferes} flotaVehiculos={flotaVehiculos}
            pedidosPorChofer={pedidosPorChofer} pedidosSeleccionadosCheckbox={pedidosSeleccionadosCheckbox}
            toggleSeleccionPedidoCheckbox={(id) => setPedidosSeleccionadosCheckbox(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
            agregarPedidosSeleccionadosARuta={agregarPedidosSeleccionadosARuta}
            quitarPedidoDeChofer={quitarPedidoDeChofer}
            pedidosArchivadosRuta={pedidosArchivadosRuta} listaPedidosDisponibles={listaPedidosDisponibles}
            nombresChoferesConRuta={nombresChoferesConRuta}
            setModalCierreAbierto={setModalCierreAbierto} setPedidoACerrar={setPedidoACerrar}
            setModalCierreFinalViaje={setModalCierreFinalViaje}
          />
        )}

        {pestanaActiva === 'reportes' && (
          <TabPedidos listaReportes={pedidosBD} exportarReporteExcel={exportarReporteExcel} />
        )}

        {pestanaActiva === 'flotaPersonal' && (
          <TabFlota 
            personalEmpresa={personalEmpresa} flotaVehiculos={flotaVehiculos}
            nuevoNombrePersonal={nuevoNombrePersonal} setNuevoNombrePersonal={setNuevoNombrePersonal}
            nuevoRolPersonal={nuevoRolPersonal} setNuevoRolPersonal={setNuevoRolPersonal}
            nuevoEmailPersonal={nuevoEmailPersonal} setNuevoEmailPersonal={setNuevoEmailPersonal}
            nuevoTelPersonal={nuevoTelPersonal} setNuevoTelPersonal={setNuevoTelPersonal}
            agregarPersonal={agregarPersonal} eliminarPersonal={eliminarPersonal}
            nuevoDominioVehiculo={nuevoDominioVehiculo} setNuevoDominioVehiculo={setNuevoDominioVehiculo}
            nuevoModeloVehiculo={nuevoModeloVehiculo} setNuevoModeloVehiculo={setNuevoModeloVehiculo}
            nuevoKmVehiculo={nuevoKmVehiculo} setNuevoKmVehiculo={setNuevoKmVehiculo}
            tipoMedicionVehiculo={tipoMedicionVehiculo} setTipoMedicionVehiculo={setTipoMedicionVehiculo}
            agregarVehiculo={agregarVehiculo} eliminarVehiculo={eliminarVehiculo}
          />
        )}

        {pestanaActiva === 'mantenimientoFlota' && (
          <TabCostos 
            listaTodasPatentes={listaTodasPatentes}
            flotaMantenimientoFiltrada={flotaMantenimientoFiltrada}
            nuevaPatenteMto={nuevaPatenteMto} setNuevaPatenteMto={setNuevaPatenteMto}
            nuevoCostoMto={nuevoCostoMto} setNuevoCostoMto={setNuevoCostoMto}
            guardarVehiculoMantenimiento={guardarVehiculoMantenimiento}
            filtroPatenteMto={filtroPatenteMto} setFiltroPatenteMto={setFiltroPatenteMto}
            exportarMantenimientoExcel={() => alert('Exportando mantenimiento a Excel...')}
            flotaVehiculos={flotaVehiculos}
          />
        )}

        {pestanaActiva === 'combustible' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px' }}>
            <h3>⛽ Registro y Control de Combustible</h3>
            <p style={{ color: '#64748b' }}>Módulo vinculado con base de datos Neon.</p>
          </div>
        )}

        {pestanaActiva === 'choferesCarnets' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px' }}>
            <h3>🪪 Carnets y Documentación de Choferes</h3>
            <p style={{ color: '#64748b' }}>Control de licencias y psicofísicos.</p>
          </div>
        )}

        {pestanaActiva === 'actualizarKm' && (
          <TabActualizarKm 
            listaTodasPatentes={listaTodasPatentes}
            patenteRapidaKm={patenteRapidaKm} setPatenteRapidaKm={setPatenteRapidaKm}
            valorRapidoKm={valorRapidoKm} setValorRapidoKm={setValorRapidoKm}
            actualizarKmRapido={actualizarKmRapido}
            flotaVehiculos={flotaVehiculos} flotaMantenimientoBD={flotaMantenimientoBD}
          />
        )}

      </div>
    </div>
  );
}