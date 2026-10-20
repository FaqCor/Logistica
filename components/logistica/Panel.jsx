'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import TabRutas from './TabRutas';
import TabCostos from './TabCostos';
import TabFlota from './TabFlota';
import TabPedidos from './TabPedidos';
import TabFallas from './TabFallas';

export default function Panel({ email }) {
  const esChofer = email && (email.toLowerCase().includes('chofer') || email.toLowerCase().includes('driver')); 
  const [pestanaActiva, setPestanaActiva] = useState('gestion');

  const hoy = new Date();
  const fechaFormateada = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

  const [pedidosBD, setPedidosBD] = useState([]);
  const [pedidosPorChofer, setPedidosPorChofer] = useState({});
  const [vehiculoPorChofer, setVehiculoPorChofer] = useState({});
  const [pedidosSeleccionadosCheckbox, setPedidosSeleccionadosCheckbox] = useState([]);
  const [pedidosArchivadosRuta, setPedidosArchivadosRuta] = useState([]);

  const [flotaMantenimientoBD, setFlotaMantenimientoBD] = useState([]);
  const [nuevaPatenteMto, setNuevaPatenteMto] = useState('');
  const [nuevoCostoMto, setNuevoCostoMto] = useState('');

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
  const [flotaVehiculos, setFlotaVehiculos] = useState([
    { dominio: 'NEB732', modelo: 'IVECO Daily', km: 124500, estado: 'Disponible' },
    { dominio: 'AF997GV', modelo: 'Mercedes Benz Sprinter', km: 98200, estado: 'Disponible' }
  ]);

  const listaChoferes = personalEmpresa.filter(p => p.rol === 'Chofer');
  const [choferSeleccionado, setChoferSeleccionado] = useState(listaChoferes[0]?.nombre || 'Juan Pérez');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(flotaVehiculos[0]?.dominio || 'NEB732');

  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [pedidoACerrar, setPedidoACerrar] = useState(null);
  const [modalCierreFinalViaje, setModalCierreFinalViaje] = useState(false);

  const listaTodasPatentes = Array.from(new Set([
    ...flotaVehiculos.map(v => v.dominio),
    ...flotaMantenimientoBD.map(v => v.patente)
  ])).filter(Boolean);

  const cargarDatosBD = async () => {
    try {
      const res = await fetch('/api/pedidos', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.pedidos)) setPedidosBD(data.pedidos);
      }
    } catch (err) {
      console.warn('Usando datos locales.');
    }
  };

  useEffect(() => { cargarDatosBD(); }, []);

  const agregarPersonal = (e) => {
    e.preventDefault();
    if (!nuevoNombrePersonal) return alert('Ingresa el nombre.');
    setPersonalEmpresa([...personalEmpresa, { id: Date.now(), nombre: nuevoNombrePersonal, rol: nuevoRolPersonal, email: nuevoEmailPersonal, telefono: nuevoTelPersonal }]);
    setNuevoNombrePersonal(''); setNuevoEmailPersonal(''); setNuevoTelPersonal('');
    alert('Personal registrado con éxito.');
  };

  const eliminarPersonal = (id) => {
    if (confirm('¿Eliminar integrante?')) setPersonalEmpresa(personalEmpresa.filter(p => p.id !== id));
  };

  const agregarVehiculo = (e) => {
    e.preventDefault();
    if (!nuevoDominioVehiculo || !nuevoModeloVehiculo) return alert('Ingresa patente y modelo.');
    setFlotaVehiculos([...flotaVehiculos, { dominio: nuevoDominioVehiculo.toUpperCase(), modelo: nuevoModeloVehiculo, km: Number(nuevoKmVehiculo) || 0, estado: 'Disponible' }]);
    setNuevoDominioVehiculo(''); setNuevoModeloVehiculo(''); setNuevoKmVehiculo('');
    alert('Vehículo registrado.');
  };

  const eliminarVehiculo = (dominio) => {
    if (confirm(`¿Eliminar ${dominio}?`)) setFlotaVehiculos(flotaVehiculos.filter(v => v.dominio !== dominio));
  };

  const guardarVehiculoMantenimiento = (e) => {
    e.preventDefault();
    alert('Mantenimiento guardado.');
  };

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

  const todosPedidosAsignadosIDs = Object.values(pedidosPorChofer).flat().map(p => p.id);
  const listaPedidosDisponibles = pedidosBD.filter(p => !todosPedidosAsignadosIDs.includes(p.id));
  const nombresChoferesConRuta = Object.keys(pedidosPorChofer).filter(ch => (pedidosPorChofer[ch] || []).length > 0);

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#064e3b', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{fechaFormateada}</span>
        <h1 style={{ fontSize: '20px', margin: 0 }}>Área Logística</h1>
        <span style={{ background: '#fff', color: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{vehiculoSeleccionado}</span>
      </div>

      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2>Gestión Logística y Control de Vehículos</h2>
          {!esChofer && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={() => setPestanaActiva('gestion')} style={{ background: pestanaActiva === 'gestion' ? '#1e293b' : '#334155', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗺️ Rutas</button>
              <button onClick={() => setPestanaActiva('reportes')} style={{ background: pestanaActiva === 'reportes' ? '#1e293b' : '#334155', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📊 Reportes</button>
              <button onClick={() => setPestanaActiva('flotaPersonal')} style={{ background: pestanaActiva === 'flotaPersonal' ? '#1e293b' : '#334155', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🚚 Flota y Personal</button>
              <button onClick={() => setPestanaActiva('mantenimientoFlota')} style={{ background: pestanaActiva === 'mantenimientoFlota' ? '#1e293b' : '#b45309', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🛠️ Mantenimiento</button>
              <button onClick={() => setPestanaActiva('combustible')} style={{ background: pestanaActiva === 'combustible' ? '#1e293b' : '#15803d', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>⛽ Combustible</button>
              <button onClick={() => setPestanaActiva('choferesCarnets')} style={{ background: pestanaActiva === 'choferesCarnets' ? '#1e293b' : '#0369a1', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🪪 Carnets Choferes</button>
              <button onClick={() => setPestanaActiva('actualizarKm')} style={{ background: pestanaActiva === 'actualizarKm' ? '#1e293b' : '#d97706', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>⏱️ Actualizar KM</button>
            </div>
          )}
        </div>

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

        {pestanaActiva === 'reportes' && <TabPedidos listaReportes={pedidosBD} exportarReporteExcel={exportarReporteExcel} />}
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
            agregarVehiculo={agregarVehiculo} eliminarVehiculo={eliminarVehiculo}
          />
        )}
        {pestanaActiva === 'mantenimientoFlota' && (
          <TabCostos 
            nuevaPatenteMto={nuevaPatenteMto} setNuevaPatenteMto={setNuevaPatenteMto}
            nuevoCostoMto={nuevoCostoMto} setNuevoCostoMto={setNuevoCostoMto}
            guardarVehiculoMantenimiento={guardarVehiculoMantenimiento} flotaVehiculos={flotaVehiculos}
          />
        )}
        {pestanaActiva === 'combustible' && <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}><h3>⛽ Combustible</h3><p>Módulo conectado con base de datos Neon.</p></div>}
        {pestanaActiva === 'choferesCarnets' && <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}><h3>🪪 Carnets de Choferes</h3><p>Control de licencias y vencimientos.</p></div>}
        {pestanaActiva === 'actualizarKm' && <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}><h3>⏱️ Actualizar KM</h3><p>Actualización rápida de odómetros.</p></div>}
      </div>
    </div>
  );
}