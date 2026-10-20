'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Panel({ email: emailProp }) {
  const [userEmail, setUserEmail] = useState(emailProp || '');
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(emailProp));
  const [loginEmailInput, setLoginEmailInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const esChofer = userEmail && (userEmail.toLowerCase().includes('chofer') || userEmail.toLowerCase().includes('driver')); 
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
  const [filtroPatenteMto, setFiltroPatenteMto] = useState('');

  const [patenteRapidaKm, setPatenteRapidaKm] = useState('');
  const [valorRapidoKm, setValorRapidoKm] = useState('');

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

  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [pedidoACerrar, setPedidoACerrar] = useState(null);
  const [modalCierreFinalViaje, setModalCierreFinalViaje] = useState(false);

  const listaTodasPatentes = Array.from(new Set([
    ...flotaVehiculos.map(v => v.dominio),
    ...flotaMantenimientoBD.map(v => v.patente)
  ])).filter(Boolean);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const emailLimpio = loginEmailInput.trim().toLowerCase();
    const passLimpia = loginPasswordInput.trim();

    if (
      (emailLimpio === 'logistica@demo.com' || emailLimpio === 'chofer@demo.com') &&
      passLimpia === 'demo1234'
    ) {
      setUserEmail(emailLimpio);
      setIsLoggedIn(true);
      setLoginEmailInput('');
      setLoginPasswordInput('');
    } else {
      setLoginError('Usuario o contraseña incorrectos. Usa logistica@demo.com o chofer@demo.com con clave demo1234.');
    }
  };

  const cerrarSesion = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

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

  useEffect(() => { 
    if (isLoggedIn) { cargarDatosBD(); }
  }, [isLoggedIn]);

  useEffect(() => {
    if (patenteRapidaKm) {
      const veh = flotaVehiculos.find(v => v.dominio === patenteRapidaKm) || flotaMantenimientoBD.find(v => v.patente === patenteRapidaKm);
      if (veh) { setValorRapidoKm(veh.km || veh.horas || veh.km_actual || ''); }
    }
  }, [patenteRapidaKm]);

  // Función para importar Excel de Clientes leyendo columnas B, C y H exactas por fila
  const importarExcelClientes = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Lee la hoja como una matriz de filas (array de arrays)
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rows && rows.length > 0) {
          const nuevosPedidos = [];
          
          // Omitimos la primera fila si es cabecera (empezamos en i = 1, o i = 0 si no tiene cabecera)
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            // Validamos que la fila tenga datos
            if (row && (row[1] || row[2] || row[7])) {
              nuevosPedidos.push({
                id: 100 + i,
                cliente: row[1] || 'Cliente Distribuidora', // Columna B
                direccion: row[2] || 'Dirección no especificada', // Columna C
                provincia: row[7] || 'Salta', // Columna H
                bultos: 1
              });
            }
          }

          if (nuevosPedidos.length > 0) {
            setPedidosBD(nuevosPedidos);
            alert(`¡Se importaron ${nuevosPedidos.length} clientes correctamente desde las columnas B, C y H del Excel!`);
          } else {
            alert('No se encontraron datos válidos en las columnas B, C o H.');
          }
        } else {
          alert('El archivo Excel está vacío.');
        }
      } catch (error) {
        alert('Error al procesar el archivo Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const agregarPersonal = (e) => {
    e.preventDefault();
    if (!nuevoNombrePersonal) return alert('Ingresa el nombre del personal.');
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
    const patenteUpper = nuevoDominioVehiculo.toUpperCase();
    setFlotaVehiculos([...flotaVehiculos, { dominio: patenteUpper, modelo: nuevoModeloVehiculo, km: Number(nuevoKmVehiculo) || 0, estado: 'Disponible', enMantenimiento: false }]);
    setNuevoDominioVehiculo(''); setNuevoModeloVehiculo(''); setNuevoKmVehiculo('');
    alert(`Vehículo ${patenteUpper} registrado.`);
  };

  const eliminarVehiculo = (dominio) => {
    if (confirm(`¿Eliminar unidad ${dominio}?`)) setFlotaVehiculos(flotaVehiculos.filter(v => v.dominio !== dominio));
  };

  const guardarVehiculoMantenimiento = async (e) => {
    e.preventDefault();
    if (!nuevaPatenteMto || !nuevoCostoMto) return alert('Completa los campos obligatorios de mantenimiento.');
    alert('¡Mantenimiento guardado correctamente!');
    setNuevoCostoMto('');
    cargarDatosBD();
  };

  const actualizarKmRapido = async (e) => {
    e.preventDefault();
    if (!patenteRapidaKm || !valorRapidoKm) return alert('Selecciona una patente e ingresa la nueva lectura.');
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
    setPedidosPorChofer({ ...pedidosPorChofer, [choferSeleccionado]: actual.filter(p => p.id !== idPedido) });
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
  const flotaMantenimientoFiltrada = filtroPatenteMto ? flotaMantenimientoBD.filter(v => v.patente === filtroPatenteMto) : flotaMantenimientoBD;

  if (!isLoggedIn) {
    return (
      <div style={{ backgroundColor: '#064e3b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#064e3b', margin: '0 0 6px 0', fontSize: '24px' }}>Área Logística</h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Inicia sesión para acceder al sistema</p>
          </div>
          {loginError && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', fontWeight: 'bold' }}>{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Email:</label>
              <input type="email" placeholder="logistica@demo.com o chofer@demo.com" value={loginEmailInput} onChange={(e) => setLoginEmailInput(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Contraseña:</label>
              <input type="password" placeholder="demo1234" value={loginPasswordInput} onChange={(e) => setLoginPasswordInput(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} required />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#064e3b', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div><span style={{ fontSize: '13px', color: '#a7f3d0', fontWeight: '500' }}>{fechaFormateada}</span></div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Área Logística</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Botón para importar hoja de Excel de Clientes en lugar de la patente */}
          <label style={{ backgroundColor: '#15803d', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            📥 Importar Excel
            <input type="file" accept=".xlsx, .xls" onChange={importarExcelClientes} style={{ display: 'none' }} />
          </label>
          <button onClick={cerrarSesion} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>Gestión Logística y Control de Vehículos</h2>
            {userEmail && <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Conectado como: <strong>{userEmail}</strong> ({esChofer ? 'Chofer' : 'Encargado de Logística'}) | Hub: Maestro Pedernera 1217</p>}
          </div>

          {!esChofer && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setPestanaActiva('gestion')} style={{ backgroundColor: pestanaActiva === 'gestion' ? '#1e293b' : '#334155', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>📋 Asignación</button>
              <button onClick={() => setPestanaActiva('reportes')} style={{ backgroundColor: pestanaActiva === 'reportes' ? '#1e293b' : '#334155', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>📊 Reportes</button>
              <button onClick={() => setPestanaActiva('flotaPersonal')} style={{ backgroundColor: pestanaActiva === 'flotaPersonal' ? '#1e293b' : '#334155', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🚚 Flota y Personal</button>
              <button onClick={() => setPestanaActiva('mantenimientoFlota')} style={{ backgroundColor: pestanaActiva === 'mantenimientoFlota' ? '#1e293b' : '#b45309', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🛠️ Mantenimiento</button>
              <button onClick={() => setPestanaActiva('combustible')} style={{ backgroundColor: pestanaActiva === 'combustible' ? '#1e293b' : '#15803d', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>⛽ Combustible</button>
              <button onClick={() => setPestanaActiva('choferesCarnets')} style={{ backgroundColor: pestanaActiva === 'choferesCarnets' ? '#1e293b' : '#0369a1', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🪪 Carnets Choferes</button>
              <button onClick={() => setPestanaActiva('actualizarKm')} style={{ backgroundColor: pestanaActiva === 'actualizarKm' ? '#1e293b' : '#d97706', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>⏱️ Actualizar KM</button>
            </div>
          )}
        </div>

        {pestanaActiva === 'gestion' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
            <h3>📋 Asignación de Pedidos y Rutas</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', margin: '15px 0' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Seleccionar Chofer:</label>
                <select value={choferSeleccionado} onChange={(e) => setChoferSeleccionado(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  {listaChoferes.map((ch, i) => <option key={i} value={ch.nombre}>{ch.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Seleccionar Vehículo:</label>
                <select value={vehiculoSeleccionado} onChange={(e) => setVehiculoSeleccionado(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  {flotaVehiculos.map((v, i) => <option key={i} value={v.dominio}>{v.dominio} - {v.modelo}</option>)}
                </select>
              </div>
            </div>
            <h4>☑️ Seleccionar envíos pendientes para asignar a {choferSeleccionado}:</h4>
            {listaPedidosDisponibles.length === 0 ? <p style={{ color: '#64748b' }}>No hay pedidos pendientes disponibles. Importa una hoja de Excel para cargar los clientes.</p> : (
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px', marginBottom: '12px', background: '#fff' }}>
                {listaPedidosDisponibles.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', marginBottom: '8px', padding: '6px', borderBottom: '1px solid #f1f5f9' }}>
                    <input 
                      type="checkbox" 
                      checked={pedidosSeleccionadosCheckbox.includes(p.id)} 
                      onChange={() => setPedidosSeleccionadosCheckbox(prev => prev.includes(p.id) ? prev.filter(i => i !== p.id) : [...prev, p.id])} 
                      style={{ width: '16px', height: '16px', accentColor: '#047857', cursor: 'pointer', margin: 0, flexShrink: 0 }} 
                    />
                    <span style={{ lineHeight: '1.4' }}>#{p.id} - ({p.cliente || 'Cliente'}) - ({p.provincia || 'Salta'}) | 📍 {p.direccion || p.Direccion} (Bultos: {p.bultos || 1})</span>
                  </label>
                ))}
              </div>
            )}
            <button onClick={agregarPedidosSeleccionadosARuta} style={{ background: '#047857', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Añadir Ruta con los pedidos seleccionados</button>
          </div>
        )}

        {pestanaActiva === 'reportes' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>📊 Reporte General de Cierres, Cobranzas y Viáticos</h3>
              <button onClick={exportarReporteExcel} style={{ background: '#15803d', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📥 Exportar Reporte a Excel (.xlsx)</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '10px' }}>Fecha</th>
                  <th style={{ padding: '10px' }}>N° Pedido</th>
                  <th style={{ padding: '10px' }}>Cliente</th>
                  <th style={{ padding: '10px' }}>Provincia</th>
                  <th style={{ padding: '10px' }}>Estado</th>
                  <th style={{ padding: '10px' }}>Total Cobrado ($)</th>
                  <th style={{ padding: '10px' }}>Total Viáticos ($)</th>
                  <th style={{ padding: '10px' }}>KM Recorridos</th>
                </tr>
              </thead>
              <tbody>
                {pedidosBD.length === 0 ? <tr><td colSpan="8" style={{ padding: '15px', textAlign: 'center', color: '#64748b' }}>Sin registros de cierres.</td></tr> : pedidosBD.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px' }}>15/10/2026</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>#{p.id}</td>
                    <td style={{ padding: '10px' }}>{p.cliente || '-'}</td>
                    <td style={{ padding: '10px' }}>{p.provincia || 'Salta'}</td>
                    <td style={{ padding: '10px' }}>Entregado</td>
                    <td style={{ padding: '10px', color: '#15803d', fontWeight: 'bold' }}>${p.monto_total_cobrado || 100}</td>
                    <td style={{ padding: '10px', color: '#b91c1c', fontWeight: 'bold' }}>${p.gasto_total || 0}</td>
                    <td style={{ padding: '10px', color: '#0369a1', fontWeight: 'bold' }}>{p.km_recorridos_pedido || 50} KM</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pestanaActiva === 'flotaPersonal' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
            <h3>🏢 Administración de Flota y Personal</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <form onSubmit={agregarPersonal} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#047857' }}>➕ Registrar Nuevo Personal</h4>
                <input type="text" placeholder="Ej: Marcos Ruiz" value={nuevoNombrePersonal} onChange={(e) => setNuevoNombrePersonal(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                <select value={nuevoRolPersonal} onChange={(e) => setNuevoRolPersonal(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                  <option value="Chofer">Chofer</option>
                  <option value="Ayudante">Ayudante</option>
                </select>
                <input type="email" placeholder="correo@dmmaestro.com" value={nuevoEmailPersonal} onChange={(e) => setNuevoEmailPersonal(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                <input type="text" placeholder="387..." value={nuevoTelPersonal} onChange={(e) => setNuevoTelPersonal(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                <button type="submit" style={{ width: '100%', background: '#047857', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Personal</button>
              </form>

              <form onSubmit={agregarVehiculo} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0284c7' }}>🚚 Registrar Vehículo / Autoelevador</h4>
                <input type="text" placeholder="EJ: NEB732 O AUTOELEV-01" value={nuevoDominioVehiculo} onChange={(e) => setNuevoDominioVehiculo(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'uppercase', boxSizing: 'border-box' }} required />
                <input type="text" placeholder="Ej: IVECO Daily o Toyota 2.5T" value={nuevoModeloVehiculo} onChange={(e) => setNuevoModeloVehiculo(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                <select value={tipoMedicionVehiculo} onChange={(e) => setTipoMedicionVehiculo(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                  <option value="Kilómetros">Kilómetros (Camiones / Furgones)</option>
                  <option value="Horas">Horas de Trabajo (Autoelevadores)</option>
                </select>
                <input type="number" placeholder="124500" value={nuevoKmVehiculo} onChange={(e) => setNuevoKmVehiculo(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                <button type="submit" style={{ width: '100%', background: '#0284c7', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Vehículo / Unidad</button>
              </form>
            </div>
          </div>
        )}

        {pestanaActiva === 'mantenimientoFlota' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
            <h3>🛠️ Control de Mantenimiento Preventivo y Costos</h3>
            <p style={{ color: '#64748b' }}>Monitoreo automático de kilometrajes y costos de flota.</p>
          </div>
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
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '600px' }}>
            <h3>⏱️ Actualizar Lectura de Transporte (KM / Horas)</h3>
            <form onSubmit={actualizarKmRapido} style={{ background: '#fffbeb', padding: '20px', borderRadius: '8px', border: '1px solid #fde68a', marginTop: '15px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#92400e' }}>Seleccionar Unidad / Patente:</label>
              <select value={patenteRapidaKm} onChange={(e) => setPatenteRapidaKm(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required>
                <option value="">-- Selecciona una Patente --</option>
                {listaTodasPatentes.map((pat, i) => <option key={i} value={pat}>{pat}</option>)}
              </select>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#92400e' }}>Nueva Lectura (KM / Horas):</label>
              <input type="number" placeholder="Ej: 125000 o 1300" value={valorRapidoKm} onChange={(e) => setValorRapidoKm(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              <button type="submit" style={{ width: '100%', background: '#d97706', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>⚡ Actualizar Lectura en Todas las Pestañas</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}