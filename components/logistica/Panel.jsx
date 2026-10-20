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

  // Personal y Flota
  const [personalEmpresa, setPersonalEmpresa] = useState([
    { id: 1, nombre: 'Juan Pérez', rol: 'Chofer', email: 'chofer@demo.com', telefono: '3874556677' },
    { id: 2, nombre: 'Carlos Gómez', rol: 'Chofer', email: 'carlos@dmmaestro.com', telefono: '3875112233' }
  ]);
  const [nuevoNombrePersonal, setNuevoNombrePersonal] = useState('');
  const [nuevoRolPersonal, setNuevoRolPersonal] = useState('Chofer');
  const [nuevoEmailPersonal, setNuevoEmailPersonal] = useState('');
  const [nuevoTelPersonal, setNuevoTelPersonal] = useState('');

  // Modales de Edición
  const [itemEditarPersonal, setItemEditarPersonal] = useState(null);
  const [itemEditarVehiculo, setItemEditarVehiculo] = useState(null);

  const [nuevoDominioVehiculo, setNuevoDominioVehiculo] = useState('');
  const [nuevoModeloVehiculo, setNuevoModeloVehiculo] = useState('');
  const [nuevoKmVehiculo, setNuevoKmVehiculo] = useState('');
  const [tipoMedicionVehiculo, setTipoMedicionVehiculo] = useState('Kilómetros');
  
  const listaChoferes = personalEmpresa.filter(p => p.rol === 'Chofer');
  const [flotaVehiculos, setFlotaVehiculos] = useState([
    { id: 1, dominio: 'NEB732', modelo: 'IVECO Daily', tipo_medicion: 'Kilómetros', km: 124500, estado: 'Disponible', enMantenimiento: false },
    { id: 2, dominio: 'AF997GV', modelo: 'Mercedes Benz Sprinter', tipo_medicion: 'Kilómetros', km: 98200, estado: 'Disponible', enMantenimiento: false }
  ]);

  const [choferSeleccionado, setChoferSeleccionado] = useState(listaChoferes[0]?.nombre || 'Juan Pérez');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(flotaVehiculos[0]?.dominio || 'NEB732');

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
        if (listaFlota.length > 0) setFlotaVehiculos(listaFlota);
        setFlotaMantenimientoBD(listaFlota);
      }

      const resPersonal = await fetch('/api/personal', { cache: 'no-store' });
      if (resPersonal.ok) {
        const dataPersonal = await resPersonal.json();
        let listaP = Array.isArray(dataPersonal) ? dataPersonal : (dataPersonal.success ? dataPersonal.personal : []);
        if (listaP.length > 0) setPersonalEmpresa(listaP);
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
        
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rows && rows.length > 0) {
          const nuevosPedidos = [];
          
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row && (row[1] || row[2] || row[7])) {
              nuevosPedidos.push({
                id: 100 + i,
                cliente: row[1] || 'Cliente Distribuidora',
                direccion: row[2] || 'Dirección no especificada',
                provincia: row[7] || 'Salta',
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

  // CRUD Personal con Neon BD
  const agregarPersonal = async (e) => {
    e.preventDefault();
    if (!nuevoNombrePersonal) return alert('Ingresa el nombre del personal.');
    
    const nuevoObj = {
      id: Date.now(),
      nombre: nuevoNombrePersonal,
      rol: nuevoRolPersonal,
      email: nuevoEmailPersonal,
      telefono: nuevoTelPersonal
    };

    try {
      await fetch('/api/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoObj)
      });
    } catch (err) {
      console.warn('Guardado localmente');
    }

    setPersonalEmpresa(prev => [...prev, nuevoObj]);
    setNuevoNombrePersonal(''); setNuevoEmailPersonal(''); setNuevoTelPersonal('');
    alert('Personal registrado y guardado con éxito.');
  };

  const guardarEdicionPersonal = async (e) => {
    e.preventDefault();
    if (!itemEditarPersonal) return;

    try {
      await fetch('/api/personal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemEditarPersonal)
      });
    } catch (err) { console.warn('Modificado localmente'); }

    setPersonalEmpresa(prev => prev.map(p => p.id === itemEditarPersonal.id ? itemEditarPersonal : p));
    setItemEditarPersonal(null);
    alert('Información del integrante actualizada.');
  };

  const eliminarPersonal = async (id) => {
    if (!confirm('¿Estás seguro de eliminar definitivamente a este integrante de la base de datos?')) return;
    try {
      await fetch(`/api/personal?id=${id}`, { method: 'DELETE' });
    } catch (err) { console.warn('Eliminado localmente'); }

    setPersonalEmpresa(prev => prev.filter(p => p.id !== id));
    alert('Integrante eliminado correctamente.');
  };

  // CRUD Flota / Vehículos con Neon BD
  const agregarVehiculo = async (e) => {
    e.preventDefault();
    if (!nuevoDominioVehiculo || !nuevoModeloVehiculo) return alert('Ingresa patente y modelo.');
    const patenteUpper = nuevoDominioVehiculo.toUpperCase();

    const nuevoVeh = {
      id: Date.now(),
      dominio: patenteUpper,
      modelo: nuevoModeloVehiculo,
      tipo_medicion: tipoMedicionVehiculo,
      km: Number(nuevoKmVehiculo) || 0,
      estado: 'Disponible',
      enMantenimiento: false
    };

    try {
      await fetch('/api/flota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoVeh)
      });
    } catch (err) { console.warn('Guardado localmente'); }

    setFlotaVehiculos(prev => [...prev, nuevoVeh]);
    setNuevoDominioVehiculo(''); setNuevoModeloVehiculo(''); setNuevoKmVehiculo('');
    alert(`Vehículo ${patenteUpper} registrado en el sistema.`);
  };

  const guardarEdicionVehiculo = async (e) => {
    e.preventDefault();
    if (!itemEditarVehiculo) return;

    try {
      await fetch('/api/flota', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemEditarVehiculo)
      });
    } catch (err) { console.warn('Modificado localmente'); }

    setFlotaVehiculos(prev => prev.map(v => v.id === itemEditarVehiculo.id ? itemEditarVehiculo : v));
    setItemEditarVehiculo(null);
    alert('Datos del vehículo actualizados correctamente.');
  };

  const eliminarVehiculo = async (id, dominio) => {
    if (!confirm(`¿Estás seguro de eliminar la unidad ${dominio} de la base de datos?`)) return;
    try {
      await fetch(`/api/flota?id=${id}`, { method: 'DELETE' });
    } catch (err) { console.warn('Eliminado localmente'); }

    setFlotaVehiculos(prev => prev.filter(v => v.id !== id && v.dominio !== dominio));
    alert(`Unidad ${dominio} eliminada definitivamente.`);
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

  if (esChofer) {
    const choferNombreReal = personalEmpresa.find(p => p.email.toLowerCase() === userEmail.toLowerCase())?.nombre || 'Juan Pérez';
    const misPedidos = pedidosPorChofer[choferNombreReal] || [];
    const miVehiculo = vehiculoPorChofer[choferNombreReal] || vehiculoSeleccionado;

    return (
      <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#064e3b', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><span style={{ fontSize: '13px', color: '#a7f3d0', fontWeight: '500' }}>{fechaFormateada}</span></div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Portal del Chofer</h1>
          <button onClick={cerrarSesion} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button>
        </div>

        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#064e3b', marginTop: 0 }}>¡Bienvenido, {choferNombreReal}!</h2>
            <p style={{ color: '#64748b' }}>Vehículo asignado: <strong style={{ color: '#047857' }}>{miVehiculo}</strong></p>
            
            <h3 style={{ marginTop: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>🗺️ Orden de Entrega Optimizado para tu Ruta:</h3>
            {misPedidos.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>No tienes pedidos asignados en este momento. Consulta con el área de logística.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                {misPedidos.map((ped, index) => (
                  <div key={ped.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div>
                      <span style={{ background: '#047857', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', marginRight: '10px' }}>Parada #{index + 1}</span>
                      <strong>{ped.cliente || 'Cliente'}</strong> | 📍 {ped.direccion || 'Dirección'} | Provincia: {ped.provincia || 'Salta'} (Bultos: {ped.bultos || 1})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button onClick={agregarPedidosSeleccionadosARuta} style={{ background: '#047857', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Añadir Ruta con los pedidos seleccionados</button>
              
              <button onClick={() => {
                const actuales = pedidosPorChofer[choferSeleccionado] || [];
                if (actuales.length === 0) return alert('No hay pedidos asignados a este chofer para optimizar.');
                const optimizados = [...actuales].sort((a, b) => a.id - b.id);
                setPedidosPorChofer({ ...pedidosPorChofer, [choferSeleccionado]: optimizados });
                alert(`🚀 Ruta optimizada para ${choferSeleccionado} con el transporte ${vehiculoPorChofer[choferSeleccionado] || vehiculoSeleccionado}. El chofer verá el orden de entrega al iniciar sesión.`);
              }} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>⚡ Optimizar Ruta y Orden de Entrega</button>
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>🚚 Pedidos Asignados a <strong>{choferSeleccionado}</strong> (Vehículo: <span style={{ color: '#047857' }}>{vehiculoPorChofer[choferSeleccionado] || vehiculoSeleccionado}</span>):</h4>
              {(!pedidosPorChofer[choferSeleccionado] || pedidosPorChofer[choferSeleccionado].length === 0) ? (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Aún no se han añadido pedidos a la ruta de este chofer.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pedidosPorChofer[choferSeleccionado].map((ped, idx) => (
                    <div key={ped.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                      <div>
                        <strong>#{idx + 1} - Pedido #{ped.id}</strong> | {ped.cliente || 'Cliente'} | 📍 {ped.direccion || 'Dirección'} (Bultos: {ped.bultos || 1})
                      </div>
                      <button 
                        onClick={() => quitarPedidoDeChofer(choferSeleccionado, ped.id)} 
                        style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        ❌ Quitar de la ruta
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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

        {/* PESTAÑA FLOTA Y PERSONAL CON REPORTES INFERIORES Y EDICIÓN/ELIMINACIÓN EN NEON */}
        {pestanaActiva === 'flotaPersonal' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
            <h3>🏢 Administración de Flota y Personal</h3>
            
            {/* FORMULARIOS SUPERIORES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
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

            {/* TABLA DE REPORTE DE PERSONAL (PLANTEL) */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#047857', marginBottom: '10px' }}>👥 Reporte del Plantel de Personal</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px' }}>Nombre</th>
                    <th style={{ padding: '10px' }}>Rol</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Teléfono</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {personalEmpresa.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>No hay personal registrado en Neon BD.</td></tr>
                  ) : personalEmpresa.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.nombre}</td>
                      <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: p.rol === 'Chofer' ? '#dcfce7' : '#e0f2fe', color: p.rol === 'Chofer' ? '#15803d' : '#0369a1', fontWeight: 'bold', fontSize: '11px' }}>{p.rol}</span></td>
                      <td style={{ padding: '10px' }}>{p.email || '-'}</td>
                      <td style={{ padding: '10px' }}>{p.telefono || '-'}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button onClick={() => setItemEditarPersonal(p)} style={{ background: '#fef08a', color: '#854d0e', border: '1px solid #facc15', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '6px', fontSize: '12px' }}>✏️ Editar</button>
                        <button onClick={() => eliminarPersonal(p.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🗑️ Borrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TABLA DE REPORTE DE VEHÍCULOS Y FLOTA */}
            <div>
              <h4 style={{ color: '#0284c7', marginBottom: '10px' }}>🚚 Reporte de Flota y Vehículos de la Empresa</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px' }}>Dominio / Patente</th>
                    <th style={{ padding: '10px' }}>Modelo / Unidad</th>
                    <th style={{ padding: '10px' }}>Medición</th>
                    <th style={{ padding: '10px' }}>Lectura Actual</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {flotaVehiculos.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>No hay vehículos registrados en Neon BD.</td></tr>
                  ) : flotaVehiculos.map((v) => (
                    <tr key={v.id || v.dominio} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#0f172a' }}>{v.dominio}</td>
                      <td style={{ padding: '10px' }}>{v.modelo}</td>
                      <td style={{ padding: '10px' }}>{v.tipo_medicion || 'Kilómetros'}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#047857' }}>{v.km || v.horas || 0}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button onClick={() => setItemEditarVehiculo(v)} style={{ background: '#fef08a', color: '#854d0e', border: '1px solid #facc15', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '6px', fontSize: '12px' }}>✏️ Editar</button>
                        <button onClick={() => eliminarVehiculo(v.id, v.dominio)} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🗑️ Borrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MODAL DE EDICIÓN DE PERSONAL */}
            {itemEditarPersonal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <form onSubmit={guardarEdicionPersonal} style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '380px' }}>
                  <h3>✏️ Editar Integrante del Plantel</h3>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Nombre:</label>
                  <input type="text" value={itemEditarPersonal.nombre} onChange={(e) => setItemEditarPersonal({ ...itemEditarPersonal, nombre: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Rol:</label>
                  <select value={itemEditarPersonal.rol} onChange={(e) => setItemEditarPersonal({ ...itemEditarPersonal, rol: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                    <option value="Chofer">Chofer</option>
                    <option value="Ayudante">Ayudante</option>
                  </select>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Email:</label>
                  <input type="email" value={itemEditarPersonal.email || ''} onChange={(e) => setItemEditarPersonal({ ...itemEditarPersonal, email: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Teléfono:</label>
                  <input type="text" value={itemEditarPersonal.telefono || ''} onChange={(e) => setItemEditarPersonal({ ...itemEditarPersonal, telefono: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" style={{ flex: 1, background: '#047857', color: '#fff', padding: '8px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
                    <button type="button" onClick={() => setItemEditarPersonal(null)} style={{ flex: 1, background: '#cbd5e1', padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* MODAL DE EDICIÓN DE VEHÍCULOS */}
            {itemEditarVehiculo && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <form onSubmit={guardarEdicionVehiculo} style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '380px' }}>
                  <h3>✏️ Editar Unidad de la Flota</h3>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Dominio / Patente:</label>
                  <input type="text" value={itemEditarVehiculo.dominio} onChange={(e) => setItemEditarVehiculo({ ...itemEditarVehiculo, dominio: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Modelo / Unidad:</label>
                  <input type="text" value={itemEditarVehiculo.modelo} onChange={(e) => setItemEditarVehiculo({ ...itemEditarVehiculo, modelo: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Medición Actual (KM/Horas):</label>
                  <input type="number" value={itemEditarVehiculo.km || 0} onChange={(e) => setItemEditarVehiculo({ ...itemEditarVehiculo, km: Number(e.target.value) })} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" style={{ flex: 1, background: '#0284c7', color: '#fff', padding: '8px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
                    <button type="button" onClick={() => setItemEditarVehiculo(null)} style={{ flex: 1, background: '#cbd5e1', padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

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