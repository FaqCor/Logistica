'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Panel({ email }) {
  const esChofer = email && (email.toLowerCase().includes('chofer') || email.toLowerCase().includes('driver')); 

  const [pestanaActiva, setPestanaActiva] = useState('gestion');

  // Estado del checklist
  const [checklistEnviado, setChecklistEnviado] = useState(false);
  const [kmChecklist, setKmChecklist] = useState('54000');
  const [enviandoChecklist, setEnviandoChecklist] = useState(false);

  // Fecha actual
  const hoy = new Date();
  const fechaFormateada = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

  // Estados de datos
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosExcel, setDatosExcel] = useState([]);
  const [importando, setImportando] = useState(false);
  
  const [pedidosBD, setPedidosBD] = useState([]);
  
  // Mapeo de pedidos asignados por chofer
  const [pedidosPorChofer, setPedidosPorChofer] = useState({});
  const [pedidosSeleccionadosCheckbox, setPedidosSeleccionadosCheckbox] = useState([]);

  // Estado local para ocultar entregados en la vista de rutas
  const [pedidosArchivadosRuta, setPedidosArchivadosRuta] = useState([]);

  // --- ESTADOS PARA MANTENIMIENTO DE FLOTA Y FILTROS ---
  const [flotaMantenimientoBD, setFlotaMantenimientoBD] = useState([]);
  const [nuevaPatenteMto, setNuevaPatenteMto] = useState('');
  const [nuevoModeloMto, setNuevoModeloMto] = useState('');
  const [nuevoKmActualMto, setNuevoKmActualMto] = useState('');
  const [nuevaFrecuenciaMto, setNuevaFrecuenciaMto] = useState('15000');
  const [nuevoUltimoMtoKm, setNuevoUltimoMtoKm] = useState('');
  const [nuevoTipoMto, setNuevoTipoMto] = useState('Service completo de aceite y filtros');
  const [nuevoCostoMto, setNuevoCostoMto] = useState('');
  const [filtroPatenteMto, setFiltroPatenteMto] = useState('');

  // --- ESTADOS PARA COMBUSTIBLE Y RENDIMIENTO ---
  const [cargasCombustibleBD, setCargasCombustibleBD] = useState([
    { id: 1, patente: 'NEB732', modelo: 'IVECO Daily', litros: 65, importe: 82000, kmLectura: 124500, fecha: '2026-05-10' },
    { id: 2, patente: 'AF997GV', modelo: 'Mercedes Benz Sprinter', litros: 50, importe: 63000, kmLectura: 98200, fecha: '2026-05-12' },
    { id: 3, patente: 'AD172YF', modelo: 'Mercedes Benz Atego', litros: 120, importe: 151000, kmLectura: 210400, fecha: '2026-05-14' }
  ]);
  const [patenteCombustible, setPatenteCombustible] = useState('');
  const [litrosCombustible, setLitrosCombustible] = useState('');
  const [importeCombustible, setImporteCombustible] = useState('');
  const [kmLecturaCombustible, setKmLecturaCombustible] = useState('');
  const [filtroPatenteCombustible, setFiltroPatenteCombustible] = useState('');
  const [idCargaEditando, setIdCargaEditando] = useState(null);

  // ESTADOS PESTAÑA RÁPIDA DE ACTUALIZAR KM / HORAS
  const [patenteRapidaKm, setPatenteRapidaKm] = useState('');
  const [valorRapidoKm, setValorRapidoKm] = useState('');

  // --- ESTADOS PARA CARNETS DE CHOFERES ---
  const [choferesCarnetsBD, setChoferesCarnetsBD] = useState([]);
  const [nombreChoferCarnet, setNombreChoferCarnet] = useState('');
  const [dniChoferCarnet, setDniChoferCarnet] = useState('');
  const [telChoferCarnet, setTelChoferCarnet] = useState('');
  const [vencConducir, setVencConducir] = useState('');
  const [vencPeligrosas, setVencPeligrosas] = useState('');
  const [vencGenerales, setVencGenerales] = useState('');
  const [vencPsicofisico, setVencPsicofisico] = useState('');

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

  // Campos de registro de vehículo
  const [nuevoDominioVehiculo, setNuevoDominioVehiculo] = useState('');
  const [nuevoModeloVehiculo, setNuevoModeloVehiculo] = useState('');
  const [nuevoKmVehiculo, setNuevoKmVehiculo] = useState('');
  const [tipoMedicionVehiculo, setTipoMedicionVehiculo] = useState('Kilómetros');
  const [nuevasHorasVehiculo, setNuevasHorasVehiculo] = useState('');

  // Flota y choferes
  const listaChoferes = personalEmpresa.filter(p => p.rol === 'Chofer');

  const [flotaVehiculos, setFlotaVehiculos] = useState([
    { dominio: 'NEB732', modelo: 'IVECO Daily', km: 124500, horas: 0, tipoMedicion: 'Kilómetros', estado: 'Disponible', enMantenimiento: false },
    { dominio: 'AF997GV', modelo: 'Mercedes Benz Sprinter', km: 98200, horas: 0, tipoMedicion: 'Kilómetros', estado: 'Disponible', enMantenimiento: false },
    { dominio: 'AD172YF', modelo: 'Mercedes Benz Atego', km: 210400, horas: 0, tipoMedicion: 'Kilómetros', estado: 'Disponible', enMantenimiento: false },
    { dominio: 'AUTOELEV-01', modelo: 'Autoelevador Toyota 2.5T', km: 0, horas: 1250, tipoMedicion: 'Horas', estado: 'Disponible', enMantenimiento: false }
  ]);

  const [choferSeleccionado, setChoferSeleccionado] = useState(listaChoferes[0]?.nombre || 'Juan Pérez');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(flotaVehiculos[0]?.dominio || 'NEB732');

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

  // Lista unificada de todas las patentes únicas
  const listaTodasPatentes = Array.from(new Set([
    ...flotaVehiculos.map(v => v.dominio),
    ...flotaMantenimientoBD.map(v => v.patente)
  ])).filter(Boolean);

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

  // --- REGISTRAR VEHÍCULOS / AUTOELEVADORES ---
  const agregarVehiculo = async (e) => {
    e.preventDefault();
    if (!nuevoDominioVehiculo || !nuevoModeloVehiculo) {
      alert('Por favor, ingresa la patente/identificador y el modelo.');
      return;
    }

    const patenteUpper = nuevoDominioVehiculo.toUpperCase();
    const kmVal = parseFloat(nuevoKmVehiculo) || 0;
    const horasVal = parseFloat(nuevasHorasVehiculo) || 0;
    const valorPrincipalMto = tipoMedicionVehiculo === 'Horas' ? horasVal : kmVal;

    const nuevoVeh = {
      dominio: patenteUpper,
      modelo: nuevoModeloVehiculo,
      km: kmVal,
      horas: horasVal,
      tipoMedicion: tipoMedicionVehiculo,
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
          tipo_vehiculo: tipoMedicionVehiculo === 'Horas' ? 'Autoelevador' : 'Furgón',
          km_actual: valorPrincipalMto,
          frecuencia_mto: tipoMedicionVehiculo === 'Horas' ? 250 : 15000,
          km_ultimo_service: 0,
          tipo_mantenimiento: tipoMedicionVehiculo === 'Horas' ? 'Service de Horómetro / Autoelevador' : 'Service completo de aceite y filtros',
          costo_mantenimiento: 0
        })
      });
      cargarDatosBD();
    } catch (err) {
      console.warn('No se pudo vincular directamente con la BD.');
    }

    setNuevoDominioVehiculo('');
    setNuevoModeloVehiculo('');
    setNuevoKmVehiculo('');
    setNuevasHorasVehiculo('');
    setTipoMedicionVehiculo('Kilómetros');
    alert(`¡Vehículo/Unidad patente ${patenteUpper} registrado y vinculado!`);
  };

  const eliminarVehiculo = (dominio) => {
    if (confirm(`¿Deseas eliminar la unidad/vehículo patente ${dominio} de la flota?`)) {
      setFlotaVehiculos(flotaVehiculos.filter(v => v.dominio !== dominio));
    }
  };

  const guardarVehiculoMantenimiento = async (e) => {
    e.preventDefault();
    if (!nuevaPatenteMto || !nuevoKmActualMto) {
      alert('Por favor, selecciona la patente y el kilometraje/horas actuales.');
      return;
    }

    try {
      const res = await fetch('/api/flota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patente: nuevaPatenteMto,
          modelo: nuevoModeloMto || 'Vehículo General',
          tipo_vehiculo: 'Furgón',
          km_actual: Number(nuevoKmActualMto),
          frecuencia_mto: Number(nuevaFrecuenciaMto) || 15000,
          km_ultimo_service: Number(nuevoUltimoMtoKm) || 0,
          tipo_mantenimiento: nuevoTipoMto,
          mantenimiento_a_realizar: 'Service preventivo programado',
          costo_mantenimiento: Number(nuevoCostoMto) || 0
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('¡Mantenimiento y costos guardados correctamente!');
        setNuevaPatenteMto('');
        setNuevoModeloMto('');
        setNuevoKmActualMto('');
        setNuevoUltimoMtoKm('');
        setNuevoCostoMto('');
        cargarDatosBD();
      } else {
        alert('Error: ' + (data.error || 'No se pudo guardar'));
      }
    } catch (error) {
      alert('Error al conectar con el servidor.');
    }
  };

  const guardarCargaCombustible = (e) => {
    e.preventDefault();
    if (!patenteCombustible || !litrosCombustible || !importeCombustible) {
      alert('Por favor, completa la patente, litros y el importe total.');
      return;
    }

    const veh = flotaVehiculos.find(v => v.dominio === patenteCombustible) || flotaMantenimientoBD.find(v => v.patente === patenteCombustible);

    if (idCargaEditando) {
      setCargasCombustibleBD(cargasCombustibleBD.map(c => c.id === idCargaEditando ? {
        ...c,
        patente: patenteCombustible,
        modelo: veh?.modelo || c.modelo || 'Unidad Flota',
        litros: Number(litrosCombustible),
        importe: Number(importeCombustible),
        kmLectura: Number(kmLecturaCombustible) || c.kmLectura
      } : c));
      setIdCargaEditando(null);
      alert('¡Registro de combustible modificado con éxito!');
    } else {
      const nuevaCarga = {
        id: Date.now(),
        patente: patenteCombustible,
        modelo: veh?.modelo || 'Unidad Flota',
        litros: Number(litrosCombustible),
        importe: Number(importeCombustible),
        kmLectura: Number(kmLecturaCombustible) || Number(veh?.km || veh?.horas || 0),
        fecha: new Date().toISOString().slice(0, 10)
      };
      setCargasCombustibleBD([nuevaCarga, ...cargasCombustibleBD]);
      alert(`¡Carga de combustible de ${nuevaCarga.litros} Lts ($${nuevaCarga.importe.toLocaleString()}) registrada con éxito!`);
    }

    setPatenteCombustible('');
    setLitrosCombustible('');
    setImporteCombustible('');
    setKmLecturaCombustible('');
  };

  const editarCargaCombustible = (carga) => {
    setIdCargaEditando(carga.id);
    setPatenteCombustible(carga.patente);
    setLitrosCombustible(carga.litros);
    setImporteCombustible(carga.importe);
    setKmLecturaCombustible(carga.kmLectura);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarCargaCombustible = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de combustible?')) {
      setCargasCombustibleBD(cargasCombustibleBD.filter(c => c.id !== id));
    }
  };

  const exportarCombustibleExcel = () => {
    const listaExportar = filtroPatenteCombustible
      ? cargasCombustibleBD.filter(c => c.patente === filtroPatenteCombustible)
      : cargasCombustibleBD;

    const datosExportar = listaExportar.map(c => ({
      'Fecha': c.fecha,
      'Patente': c.patente,
      'Modelo': c.modelo,
      'Litros Cargados': c.litros,
      'Importe Total ($)': c.importe,
      'Lectura Odómetro / Horómetro': c.kmLectura,
      'Costo / Litro ($)': (c.importe / (c.litros || 1)).toFixed(2)
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consumo_Combustible');
    XLSX.writeFile(workbook, `Reporte_Combustible_Flota_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportarMantenimientoExcel = () => {
    const listaExportar = filtroPatenteMto 
      ? flotaMantenimientoBD.filter(v => v.patente === filtroPatenteMto)
      : flotaMantenimientoBD;

    const datosExportar = listaExportar.map(v => {
      const kmActual = Number(v.km_actual || 0);
      const ultimoMto = Number(v.km_ultimo_service || 0);
      const frecuencia = Number(v.frecuencia_mto || 15000);
      const proximoServiceKm = ultimoMto + frecuencia;
      const kmRestantes = proximoServiceKm - kmActual;
      const estado = kmRestantes <= 0 ? 'VENCIDO' : kmRestantes <= 2500 ? 'ALERTA' : 'En Vigencia';

      return {
        'Patente': v.patente,
        'Modelo': v.modelo || '-',
        'Uso / Lectura Actual': kmActual,
        'Lectura Último Service': ultimoMto,
        'Frecuencia Mto': frecuencia,
        'Próximo Service': proximoServiceKm,
        'Costo Acumulado ($)': Number(v.costo_mantenimiento || 0),
        'Estado': estado
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mantenimiento_Flota');
    XLSX.writeFile(workbook, `Reporte_Mantenimiento_Flota_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const actualizarKmRapido = async (e) => {
    e.preventDefault();
    if (!patenteRapidaKm || !valorRapidoKm) {
      alert('Por favor, selecciona una patente e ingresa la nueva lectura (KM u Horas).');
      return;
    }

    const kmNumerico = Number(valorRapidoKm);
    const patenteUpper = patenteRapidaKm.toUpperCase();
    const vehiculoExistente = flotaMantenimientoBD.find(v => v.patente === patenteUpper);

    try {
      const res = await fetch('/api/flota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patente: patenteUpper,
          modelo: vehiculoExistente?.modelo || 'Transporte Flota',
          tipo_vehiculo: vehiculoExistente?.tipo_vehiculo || 'Furgón',
          km_actual: kmNumerico,
          frecuencia_mto: vehiculoExistente?.frecuencia_mto || 15000,
          km_ultimo_service: vehiculoExistente?.km_ultimo_service || 0,
          tipo_mantenimiento: vehiculoExistente?.tipo_mantenimiento || 'Mantenimiento General',
          costo_mantenimiento: vehiculoExistente?.costo_mantenimiento || 0
        })
      });

      const data = await res.json();

      if (res.ok) {
        setFlotaVehiculos(prev => prev.map(v => v.dominio === patenteUpper ? { ...v, km: kmNumerico, horas: kmNumerico } : v));
        alert(`¡Lectura de la patente ${patenteUpper} actualizada a ${kmNumerico} en todas las pestañas!`);
        setValorRapidoKm('');
        cargarDatosBD();
      } else {
        alert('Error: ' + (data.error || 'No se pudo actualizar la lectura'));
      }
    } catch (error) {
      alert('Error de conexión al actualizar la lectura.');
    }
  };

  const guardarChoferCarnet = async (e) => {
    e.preventDefault();
    if (!nombreChoferCarnet || !dniChoferCarnet) {
      alert('Por favor, ingresa el nombre y DNI del chofer.');
      return;
    }

    try {
      const res = await fetch('/api/chofer/carnets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_chofer: nombreChoferCarnet,
          dni: dniChoferCarnet,
          telefono: telChoferCarnet || 'Sin teléfono',
          vencimiento_carnet_conducir: vencConducir || null,
          vencimiento_cargas_peligrosas: vencPeligrosas || null,
          vencimiento_cargas_generales: vencGenerales || null,
          vencimiento_psicofisico: vencPsicofisico || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('¡Carnets y documentación del chofer guardados con éxito!');
        setNombreChoferCarnet('');
        setDniChoferCarnet('');
        setTelChoferCarnet('');
        setVencConducir('');
        setVencPeligrosas('');
        setVencGenerales('');
        setVencPsicofisico('');
        cargarDatosBD();
      } else {
        alert('Error: ' + (data.error || 'No se pudo guardar'));
      }
    } catch (err) {
      alert('Error al conectar con el servidor de carnets.');
    }
  };

  const editarChoferCarnet = (chofer) => {
    setNombreChoferCarnet(chofer.nombre_chofer || '');
    setDniChoferCarnet(chofer.dni || '');
    setTelChoferCarnet(chofer.telefono || '');
    setVencConducir(chofer.vencimiento_carnet_conducir ? chofer.vencimiento_carnet_conducir.slice(0, 10) : '');
    setVencPeligrosas(chofer.vencimiento_cargas_peligrosas ? chofer.vencimiento_cargas_peligrosas.slice(0, 10) : '');
    setVencGenerales(chofer.vencimiento_cargas_generales ? chofer.vencimiento_cargas_generales.slice(0, 10) : '');
    setVencPsicofisico(chofer.vencimiento_psicofisico ? chofer.vencimiento_psicofisico.slice(0, 10) : '');
  };

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
        let listaFlota = [];
        if (Array.isArray(dataFlota)) {
          listaFlota = dataFlota;
        } else if (dataFlota.success && Array.isArray(dataFlota.flota)) {
          listaFlota = dataFlota.flota;
        }
        
        setFlotaMantenimientoBD(listaFlota);

        if (listaFlota.length > 0) {
          setFlotaVehiculos(prev => {
            const combinados = [...prev];
            listaFlota.forEach(bdVeh => {
              const idx = combinados.findIndex(v => v.dominio === bdVeh.patente);
              if (idx !== -1) {
                combinados[idx].km = Number(bdVeh.km_actual || combinados[idx].km);
              } else {
                combinados.push({
                  dominio: bdVeh.patente,
                  modelo: bdVeh.modelo || 'Transporte Flota',
                  km: Number(bdVeh.km_actual || 0),
                  horas: Number(bdVeh.km_actual || 0),
                  tipoMedicion: bdVeh.tipo_vehiculo === 'Autoelevador' ? 'Horas' : 'Kilómetros',
                  estado: 'Disponible',
                  enMantenimiento: false
                });
              }
            });
            return combinados;
          });
        }
      }

      const resCarnets = await fetch('/api/chofer/carnets', { cache: 'no-store' });
      if (resCarnets.ok) {
        const dataCarnets = await resCarnets.json();
        if (Array.isArray(dataCarnets)) {
          setChoferesCarnetsBD(dataCarnets);
        }
      }
    } catch (err) {
      console.warn('Utilizando datos locales.');
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

  useEffect(() => {
    if (patenteRapidaKm) {
      const veh = flotaVehiculos.find(v => v.dominio === patenteRapidaKm) || flotaMantenimientoBD.find(v => v.patente === patenteRapidaKm);
      if (veh) {
        setValorRapidoKm(veh.km || veh.horas || veh.km_actual || '');
      }
    }
  }, [patenteRapidaKm]);

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
      alert('¡Checklist enviado correctamente!');
    }, 600);
  };

  // --- SELECCIÓN MÚLTIPLE CON CHECKBOXES PARA EL CHOFER ACTUAL ---
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

    // Asignar al chofer seleccionado actualmente
    const actualAsignados = pedidosPorChofer[choferSeleccionado] || [];
    const combinados = [...actualAsignados, ...pedidosAgn.filter(nuevo => !actualAsignados.some(ex => ex.id === nuevo.id))];

    setPedidosPorChofer({
      ...pedidosPorChofer,
      [choferSeleccionado]: combinados
    });

    // Cambiar estado del vehículo seleccionado a En Viaje
    setFlotaVehiculos(flotaVehiculos.map(v => v.dominio === vehiculoSeleccionado ? { ...v, estado: 'En Viaje' } : v));
    
    // Limpiar selección de casillas
    setPedidosSeleccionadosCheckbox([]);
    alert(`¡Se asignaron ${pedidosAgn.length} pedidos al chofer ${choferSeleccionado} con éxito!`);
  };

  // --- OPTIMIZACIÓN DE RUTA DE CUALQUIER CHOFER ---
  const optimizarRutaEspecificaChofer = (nombreChofer) => {
    const pedidosChoferTarget = pedidosPorChofer[nombreChofer] || [];
    if (pedidosChoferTarget.length === 0) {
      alert(`No hay pedidos asignados a ${nombreChofer} para optimizar.`);
      return;
    }

    const rutaOrdenada = [...pedidosChoferTarget].sort((a, b) => {
      const distA = Number(a.kmDesdeCD || a.km_desde_cd || 50);
      const distB = Number(b.kmDesdeCD || b.km_desde_cd || 50);
      return distA - distB;
    });

    const maxDist = Math.max(...rutaOrdenada.map(p => Number(p.kmDesdeCD || p.km_desde_cd || 50)));
    const kmTotalCalculado = Math.round(maxDist * 2.15);
    
    setPedidosPorChofer({
      ...pedidosPorChofer,
      [nombreChofer]: rutaOrdenada
    });

    if (nombreChofer === choferSeleccionado) {
      setKmTotalRuta(kmTotalCalculado);
    }

    alert(`¡Ruta de ${nombreChofer} optimizada por cercanía!\nKilometraje total estimado: ${kmTotalCalculado} km.`);
  };

  const optimizarRutaOrdenada = () => {
    optimizarRutaEspecificaChofer(choferSeleccionado);
  };

  // --- ENVIAR WHATSAPP A UN CHOFER ESPECÍFICO ---
  const enviarRutaWhatsAppEspecifico = (nombreChofer) => {
    const listaAEnviar = pedidosPorChofer[nombreChofer] || [];
    if (listaAEnviar.length === 0) {
      alert(`No hay pedidos asignados a ${nombreChofer} para enviar.`);
      return;
    }

    const maxDist = Math.max(...listaAEnviar.map(p => Number(p.kmDesdeCD || p.km_desde_cd || 50)));
    const kmCalc = Math.round(maxDist * 2.15);

    let mensaje = `🚛 *HOJA DE RUTA OPTIMIZADA*\n`;
    mensaje += `*Chofer:* ${nombreChofer}\n`;
    mensaje += `*Fecha:* ${fechaFormateada}\n`;
    mensaje += `*Recorrido Estimado:* ${kmCalc} KM\n\n`;
    mensaje += `📍 *PARADAS Y ORDEN DE DESCARGA:*\n`;

    listaAEnviar.forEach((p, index) => {
      mensaje += `\n*${index + 1}. Parada #${p.id}* - ${p.cliente || p.Cliente}\n`;
      mensaje += `📍 Dirección: ${p.direccion || p.Direccion} (${p.provincia || 'Salta'})\n`;
      mensaje += `📦 Bultos: ${p.bultos || 1}\n`;
    });

    const choferObj = personalEmpresa.find(p => p.nombre === nombreChofer);
    const telefonoChofer = choferObj?.telefono ? choferObj.telefono.replace(/\D/g, '') : '3874556677';

    const url = `https://wa.me/549${telefonoChofer}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const enviarRutaWhatsApp = () => {
    enviarRutaWhatsAppEspecifico(choferSeleccionado);
  };

  const guardarCierreChofer = async () => {
    if (!pedidoACerrar) return;

    const esOtraProvincia = (pedidoACerrar.provincia || 'Salta').toLowerCase() !== 'salta';
    const kmPedido = esOtraProvincia ? (parseFloat(kmEntregaInterurbana) || Number(pedidoACerrar.kmDesdeCD || pedidoACerrar.km_desde_cd || 0)) : Number(pedidoACerrar.kmDesdeCD || pedidoACerrar.km_desde_cd || 0);
    
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
            tipo_vehiculo: vehiculoEnUso.tipo_vehiculo || 'Furgón',
            km_actual: nuevoKmActual,
            frecuencia_mto: vehiculoEnUso.frecuencia_mto || 15000,
            km_ultimo_service: vehiculoEnUso.km_ultimo_service || 0,
            tipo_mantenimiento: vehiculoEnUso.tipo_mantenimiento,
            costo_mantenimiento: vehiculoEnUso.costo_mantenimiento || 0
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

    const actualChoferArr = pedidosPorChofer[choferSeleccionado] || [];
    setPedidosPorChofer({
      ...pedidosPorChofer,
      [choferSeleccionado]: actualizarLista(actualChoferArr)
    });
    setPedidosBD(actualizarLista(pedidosBD));

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
            tipo_vehiculo: vehiculoEnUso.tipo_vehiculo || 'Furgón',
            km_actual: Number(kmFinalViajeSalta),
            frecuencia_mto: vehiculoEnUso.frecuencia_mto || 15000,
            km_ultimo_service: vehiculoEnUso.km_ultimo_service || 0,
            tipo_mantenimiento: vehiculoEnUso.tipo_mantenimiento,
            costo_mantenimiento: vehiculoEnUso.costo_mantenimiento || 0
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
    const listaReporte = pedidosBD.length > 0 ? pedidosBD : pedidosEjemplo;
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
      'KM Recorridos': Number(p.km_recorridos_pedido || p.kmDesdeCD || p.km_desde_cd || 0)
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte_Cierres');
    XLSX.writeFile(workbook, `Reporte_Cierres_Logistica_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const cerrarSesion = () => {
    window.location.href = '/login';
  };

  // Obtener todos los IDs de pedidos que YA han sido asignados
  const todosPedidosAsignadosIDs = Object.values(pedidosPorChofer).flat().map(p => p.id);
  
  // Lista global de pedidos disponibles que NO han sido asignados
  const listaPedidosDisponibles = (pedidosBD.length > 0 ? pedidosBD : pedidosEjemplo).filter(
    p => !todosPedidosAsignadosIDs.includes(p.id)
  );

  const pedidosChoferActual = pedidosPorChofer[choferSeleccionado] || [];
  const listaMostrada = pedidosChoferActual.filter(p => !pedidosArchivadosRuta.includes(p.id));
  const listaReportes = pedidosBD.length > 0 ? pedidosBD : [];

  const vehiculosOrdenadosCostos = [...flotaMantenimientoBD].sort((a, b) => Number(b.costo_mantenimiento || 0) - Number(a.costo_mantenimiento || 0));
  
  const resumenCombustibleAgrupado = Object.values(cargasCombustibleBD.reduce((acc, curr) => {
    if (!acc[curr.patente]) {
      acc[curr.patente] = { patente: curr.patente, modelo: curr.modelo, totalLitros: 0, totalImporte: 0 };
    }
    acc[curr.patente].totalLitros += curr.litros;
    acc[curr.patente].totalImporte += curr.importe;
    return acc;
  }, {})).sort((a, b) => b.totalImporte - a.totalImporte);

  const hoyFecha = new Date();
  const choferesEnAlerta = choferesCarnetsBD.filter(c => {
    const vencimientos = [c.vencimiento_carnet_conducir, c.vencimiento_cargas_peligrosas, c.vencimiento_cargas_generales, c.vencimiento_psicofisico];
    return vencimientos.some(v => {
      if (!v) return false;
      const diasRestantes = (new Date(v) - hoyFecha) / (1000 * 60 * 60 * 24);
      return diasRestantes <= 30;
    });
  });

  const flotaMantenimientoFiltrada = filtroPatenteMto 
    ? flotaMantenimientoBD.filter(v => v.patente === filtroPatenteMto)
    : flotaMantenimientoBD;

  const cargasCombustibleFiltradas = filtroPatenteCombustible
    ? cargasCombustibleBD.filter(c => c.patente === filtroPatenteCombustible)
    : cargasCombustibleBD;

  // Lista de choferes que tienen al menos 1 pedido asignado para armar el reporte
  const nombresChoferesConRuta = Object.keys(pedidosPorChofer).filter(ch => (pedidosPorChofer[ch] || []).length > 0);

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER VERDE OSCURO */}
      <div style={{ 
        backgroundColor: '#064e3b', 
        color: '#fff', 
        padding: '14px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'relative'
      }}>
        <div>
          <span style={{ fontSize: '13px', color: '#a7f3d0', fontWeight: '500' }}>
            {fechaFormateada}
          </span>
        </div>

        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px' }}>
            Área Logística
          </h1>
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
        
        {/* TÍTULO Y BOTONERA DE NAVEGACIÓN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
              {esChofer ? 'Mi Ruta y Transporte Asignado' : 'Gestión Logística y Control de Vehículos'}
            </h1>
            {email && (
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                Conectado como: <strong>{email}</strong> ({esChofer ? 'Chofer' : 'Encargado de Logística'}) | Hub: <strong>Maestro Pedernera 1217</strong>
              </p>
            )}
          </div>
          
          {!esChofer && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => document.getElementById('inputExcelVentas').click()}
                style={{ backgroundColor: '#047857', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                📊 Importar Excel
              </button>
              <input type="file" id="inputExcelVentas" accept=".xlsx, .xls, .csv" style={{ display: 'none' }} onChange={handleFileUpload} />

              <button 
                onClick={() => { setPestanaActiva('gestion'); cargarDatosBD(); }}
                style={{ backgroundColor: pestanaActiva === 'gestion' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
              >
                🗺️ Rutas
              </button>

              <button 
                onClick={() => { setPestanaActiva('reportes'); cargarDatosBD(); }}
                style={{ backgroundColor: pestanaActiva === 'reportes' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
              >
                📊 Reportes
              </button>

              <button 
                onClick={() => setPestanaActiva('flotaPersonal')}
                style={{ backgroundColor: pestanaActiva === 'flotaPersonal' ? '#1e293b' : '#64748b', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
              >
                🚚 Flota y Personal
              </button>

              <button 
                onClick={() => setPestanaActiva('mantenimientoFlota')}
                style={{ backgroundColor: pestanaActiva === 'mantenimientoFlota' ? '#1e293b' : '#b45309', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
              >
                🛠️ Mantenimiento
              </button>

              <button 
                onClick={() => setPestanaActiva('combustible')}
                style={{ backgroundColor: pestanaActiva === 'combustible' ? '#1e293b' : '#15803d', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                ⛽ Combustible
              </button>

              <button 
                onClick={() => { setPestanaActiva('choferesCarnets'); cargarDatosBD(); }}
                style={{ backgroundColor: pestanaActiva === 'choferesCarnets' ? '#1e293b' : '#0369a1', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
              >
                🪪 Carnets Choferes
              </button>

              <button 
                onClick={() => { setPestanaActiva('actualizarKm'); cargarDatosBD(); }}
                style={{ backgroundColor: pestanaActiva === 'actualizarKm' ? '#1e293b' : '#d97706', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                ⏱️ Actualizar KM
              </button>
            </div>
          )}
        </div>

        {/* RESUMEN EJECUTIVO */}
        {!esChofer && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#1e293b' }}>💰 Top Vehículos con Mayores Costos</h4>
              {vehiculosOrdenadosCostos.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Sin registros de costos aún.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155' }}>
                  {vehiculosOrdenadosCostos.slice(0, 3).map((v, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>
                      <strong style={{ fontFamily: 'monospace' }}>{v.patente}</strong>: <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>${Number(v.costo_mantenimiento || 0).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#991b1b' }}>⚠️ Alertas de Vencimiento de Carnets ({choferesEnAlerta.length})</h4>
              {choferesEnAlerta.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#166534', margin: 0, fontWeight: 'bold' }}>✅ Todos los choferes al día.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#991b1b' }}>
                  {choferesEnAlerta.slice(0, 3).map((c, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}><strong>{c.nombre_chofer}</strong> - Próximo a vencer.</li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#15803d' }}>⛽ Top Consumo de Combustible</h4>
              {resumenCombustibleAgrupado.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Sin cargas registradas.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155' }}>
                  {resumenCombustibleAgrupado.slice(0, 3).map((c, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>
                      <strong style={{ fontFamily: 'monospace' }}>{c.patente}</strong>: <span style={{ color: '#15803d', fontWeight: 'bold' }}>{c.totalLitros} Lts</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* VISTA CHOFER: CHECKLIST */}
        {esChofer && !checklistEnviado ? (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <form onSubmit={enviarChecklistVehiculo}>
              <div style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#92400e' }}>Control del vehículo</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#b45309' }}>Complétalo antes de salir desde Maestro Pedernera 1217.</p>
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
            <div>
              
              {/* PANEL DE SELECCIÓN Y ASIGNACIÓN INDIVIDUAL DE RUTAS */}
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
                            {v.dominio} - {v.modelo} ({v.tipoMedicion === 'Horas' ? `${v.horas} Horas` : `${v.km} km`})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', padding: '5px 10px', borderRadius: '6px' }}>
                      {vehiculoSeleccionado}
                    </span>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
                        {esChofer ? 'Juan Pérez' : choferSeleccionado}
                      </h2>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Ruta activa para este chofer</span>
                    </div>
                  </div>
                  
                  {!esChofer && (
                    <button 
                      onClick={() => {
                        const idsEntregados = pedidosChoferActual.filter(p => p.estado_entrega === 'Entregado').map(p => p.id);
                        setPedidosArchivadosRuta([...new Set([...pedidosArchivadosRuta, ...idsEntregados])]);
                      }}
                      style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🗑️ Archivar Entregados (Limpiar Ruta)
                    </button>
                  )}
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 'bold' }}>📍 Recorrido Estimado de la Ruta:</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>{kmTotalRuta || 830} KM Total</p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#2563eb' }}>Hub: Maestro Pedernera 1217</span>
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#334155' }}>Paradas Asignadas a {choferSeleccionado}:</h4>
                    {esChofer && (
                      <button 
                        onClick={() => setModalCierreFinalViaje(true)}
                        style={{ padding: '8px 14px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        🏁 Finalizar Viaje Completo (Cierre Hub)
                      </button>
                    )}
                  </div>

                  {listaMostrada.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginBottom: '15px' }}>
                      No hay paradas asignadas todavía para este chofer. Selecciona pedidos abajo para agregarlos.
                    </p>
                  ) : (
                    listaMostrada.map((p, idx) => {
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
                                    if (confirm(`¿Deseas quitar el pedido #${p.id} de la ruta de este chofer?`)) {
                                      const actualArr = pedidosPorChofer[choferSeleccionado] || [];
                                      setPedidosPorChofer({
                                        ...pedidosPorChofer,
                                        [choferSeleccionado]: actualArr.filter(item => item.id !== p.id)
                                      });
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
                    })
                  )}

                  {!esChofer && (
                    <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
                      <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0f172a' }}>
                        ☑️ Seleccionar envíos pendientes para asignar a <strong>{choferSeleccionado}</strong>:
                      </h5>

                      {listaPedidosDisponibles.length === 0 ? (
                        <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                          No hay más pedidos disponibles (todos ya fueron asignados a choferes o importados).
                        </p>
                      ) : (
                        <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', padding: '8px', marginBottom: '12px' }}>
                          {listaPedidosDisponibles.map((p) => {
                            const estaMarcado = pedidosSeleccionadosCheckbox.includes(p.id);
                            return (
                              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '13px' }}>
                                <input 
                                  type="checkbox" 
                                  checked={estaMarcado}
                                  onChange={() => toggleSeleccionPedidoCheckbox(p.id)}
                                  style={{ width: '16px', height: '16px', accentColor: '#047857', cursor: 'pointer' }}
                                />
                                <div style={{ flex: 1 }}>
                                  <strong>#{p.id} - {p.cliente || p.Cliente}</strong> ({p.provincia || 'Salta'}) | 📍 {p.direccion || p.Direccion} (Bultos: {p.bultos || 1})
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      <button 
                        onClick={agregarPedidosSeleccionadosARuta} 
                        style={{ padding: '10px 18px', backgroundColor: '#047857', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                      >
                        ➕ Añadir Ruta con los pedidos seleccionados
                      </button>
                    </div>
                  )}
                </div>

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

              {/* REPORTE CONSOLIDADO DE VIAJES PREPARADOS PARA EL DÍA CON DISTANCIAS REALES */}
              {!esChofer && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                        📋 Reporte de Viajes Asignados y Organizados para Hoy
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                        Visualiza todas las hojas de ruta listas por chofer, optimiza su itinerario y envíales sus entregas en orden.
                      </p>
                    </div>
                  </div>

                  {nombresChoferesConRuta.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                        Aún no has preparado viajes para ningún chofer hoy. Selecciona pedidos arriba y haz clic en "Añadir Ruta".
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {nombresChoferesConRuta.map((nombreChofer, idx) => {
                        const listaPedidosChofer = pedidosPorChofer[nombreChofer] || [];
                        const maxDist = Math.max(...listaPedidosChofer.map(p => Number(p.kmDesdeCD || p.km_desde_cd || 50)));
                        const kmEstimado = Math.round(maxDist * 2.15);

                        return (
                          <div key={idx} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', backgroundColor: '#f8fafc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>
                                  🚚 Chofer: <strong>{nombreChofer}</strong>
                                </h4>
                                <span style={{ fontSize: '12px', color: '#047857', fontWeight: 'bold' }}>
                                  {listaPedidosChofer.length} entregas programadas | Recorrido aprox: {kmEstimado} KM
                                </span>
                              </div>

                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button 
                                  onClick={() => optimizarRutaEspecificaChofer(nombreChofer)}
                                  style={{ padding: '8px 14px', backgroundColor: '#facc15', color: '#713f12', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  ⚡ Optimizar Ruta de este Chofer
                                </button>
                                <button 
                                  onClick={() => enviarRutaWhatsAppEspecifico(nombreChofer)}
                                  style={{ padding: '8px 14px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  📲 Enviar Orden por WhatsApp
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {listaPedidosChofer.map((p, index) => (
                                <div key={p.id} style={{ padding: '10px 12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                  <div>
                                    <span style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', marginRight: '10px', fontSize: '11px' }}>
                                      Parada #{index + 1}
                                    </span>
                                    <strong>#{p.id} - {p.cliente || p.Cliente}</strong> ({p.provincia || 'Salta'}) | 📍 {p.direccion || p.Direccion}
                                  </div>
                                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    📦 Bultos: {p.bultos || 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                      <td style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#f0f9ff', color: '#0369a1' }}>{Number(p.km_recorridos_pedido || p.kmDesdeCD || p.km_desde_cd || 0)} KM</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: FLOTA Y PERSONAL */}
        {pestanaActiva === 'flotaPersonal' && !esChofer && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              🏢 Administración de Flota y Personal
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Rol:</label>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Correo:</label>
                    <input 
                      type="email" 
                      placeholder="correo@dmmaestro.com" 
                      value={nuevoEmailPersonal} 
                      onChange={(e) => setNuevoEmailPersonal(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Teléfono:</label>
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

              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#064e3b', fontSize: '16px' }}>🚛 Registrar Vehículo / Autoelevador</h4>
                <form onSubmit={agregarVehiculo}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Patente / Dominio / ID:</label>
                    <input 
                      type="text" 
                      placeholder="Ej: NEB732 o AUTOELEV-01" 
                      value={nuevoDominioVehiculo} 
                      onChange={(e) => setNuevoDominioVehiculo(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'uppercase' }}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Modelo:</label>
                    <input 
                      type="text" 
                      placeholder="Ej: IVECO Daily o Toyota 2.5T" 
                      value={nuevoModeloVehiculo} 
                      onChange={(e) => setNuevoModeloVehiculo(e.target.value)} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Medición de Uso / Mantenimiento:</label>
                    <select 
                      value={tipoMedicionVehiculo} 
                      onChange={(e) => setTipoMedicionVehiculo(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                    >
                      <option value="Kilómetros">Kilómetros (Camiones / Furgones)</option>
                      <option value="Horas">Horas de Trabajo - Horómetro (Autoelevadores / Maquinaria)</option>
                    </select>
                  </div>

                  {tipoMedicionVehiculo === 'Kilómetros' ? (
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
                  ) : (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#b45309' }}>⚙️ Horas de Trabajo Actuales (Horómetro):</label>
                      <input 
                        type="number" 
                        placeholder="Ej: 1250" 
                        value={nuevasHorasVehiculo} 
                        onChange={(e) => setNuevasHorasVehiculo(e.target.value)} 
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #f59e0b', backgroundColor: '#fffbeb' }} 
                        required
                      />
                    </div>
                  )}

                  <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Guardar Vehículo / Unidad
                  </button>
                </form>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>👥 Plantel Registrado</h4>
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
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: p.rol === 'Chofer' ? '#dcfce7' : '#e0f2fe', color: p.rol === 'Chofer' ? '#166534' : '#0369a1' }}>
                              {p.rol}
                            </span>
                          </td>
                          <td style={{ padding: '8px', color: '#64748b' }}>{p.telefono}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <button onClick={() => eliminarPersonal(p.id)} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>🚛 Vehículos y Autoelevadores Activos</h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '8px' }}>Patente/ID</th>
                        <th style={{ padding: '8px' }}>Modelo</th>
                        <th style={{ padding: '8px' }}>Uso Actual</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flotaVehiculos.map((v, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', fontWeight: 'bold', fontFamily: 'monospace' }}>{v.dominio}</td>
                          <td style={{ padding: '8px' }}>{v.modelo}</td>
                          <td style={{ padding: '8px', color: v.tipoMedicion === 'Horas' ? '#b45309' : '#0284c7', fontWeight: 'bold' }}>
                            {v.tipoMedicion === 'Horas' ? `⚙️ ${v.horas} Horas` : `🛣️ ${v.km} km`}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <button onClick={() => eliminarVehiculo(v.dominio)} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
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

        {/* PESTAÑA 4: MANTENIMIENTO DE FLOTA */}
        {pestanaActiva === 'mantenimientoFlota' && !esChofer && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              🛠️ Control de Mantenimiento Preventivo y Costos
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Monitoreo automático de kilometrajes, horas de uso y costos asociados al mantenimiento de la flota.
            </p>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#b45309', fontSize: '16px' }}>📝 Registrar / Actualizar Uso (Km/Horas), Service y Costos</h4>
              <form onSubmit={guardarVehiculoMantenimiento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Patente/ID:</label>
                  <select 
                    value={nuevaPatenteMto} 
                    onChange={(e) => {
                      const pat = e.target.value;
                      setNuevaPatenteMto(pat);
                      const veh = flotaMantenimientoBD.find(v => v.patente === pat) || flotaVehiculos.find(v => v.dominio === pat);
                      if (veh) {
                        setNuevoModeloMto(veh.modelo || '');
                        setNuevoKmActualMto(veh.km_actual || veh.km || veh.horas || '');
                        setNuevaFrecuenciaMto(veh.frecuencia_mto || (veh.tipoMedicion === 'Horas' ? 250 : 15000));
                        setNuevoUltimoMtoKm(veh.km_ultimo_service || 0);
                        setNuevoCostoMto(veh.costo_mantenimiento || 0);
                      }
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontWeight: 'bold' }}
                    required
                  >
                    <option value="">-- Seleccionar Patente --</option>
                    {listaTodasPatentes.map((pat, idx) => (
                      <option key={idx} value={pat}>{pat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Modelo:</label>
                  <input 
                    type="text" 
                    placeholder="Ej: IVECO / Toyota" 
                    value={nuevoModeloMto} 
                    onChange={(e) => setNuevoModeloMto(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Km / Horas Actuales:</label>
                  <input 
                    type="number" 
                    placeholder="124500 o 1250" 
                    value={nuevoKmActualMto} 
                    onChange={(e) => setNuevoKmActualMto(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Frecuencia Service:</label>
                  <input 
                    type="number" 
                    value={nuevaFrecuenciaMto} 
                    onChange={(e) => setNuevaFrecuenciaMto(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Lectura Último Service:</label>
                  <input 
                    type="number" 
                    placeholder="115000" 
                    value={nuevoUltimoMtoKm} 
                    onChange={(e) => setNuevoUltimoMtoKm(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Costo Mantenimiento ($):</label>
                  <input 
                    type="number" 
                    placeholder="Ej: 85000" 
                    value={nuevoCostoMto} 
                    onChange={(e) => setNuevoCostoMto(e.target.value)} 
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Filtrar reporte por Patente:</label>
                <select 
                  value={filtroPatenteMto} 
                  onChange={(e) => setFiltroPatenteMto(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                >
                  <option value="">Todas las patentes</option>
                  {listaTodasPatentes.map((pat, idx) => (
                    <option key={idx} value={pat}>{pat}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={exportarMantenimientoExcel}
                style={{ backgroundColor: '#15803d', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                📥 Descargar Mantenimiento a Excel (.xlsx)
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                    <th style={{ padding: '10px' }}>Patente</th>
                    <th style={{ padding: '10px' }}>Modelo</th>
                    <th style={{ padding: '10px' }}>Lectura Actual</th>
                    <th style={{ padding: '10px' }}>Próximo Service</th>
                    <th style={{ padding: '10px' }}>Costo Acumulado</th>
                    <th style={{ padding: '10px' }}>Estado / Alerta</th>
                  </tr>
                </thead>
                <tbody>
                  {flotaMantenimientoFiltrada.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '15px', textAlign: 'center', color: '#64748b' }}>
                        No hay registros de mantenimiento para el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    flotaMantenimientoFiltrada.map((v, idx) => {
                      const kmActual = Number(v.km_actual || 0);
                      const ultimoMto = Number(v.km_ultimo_service || 0);
                      const frecuencia = Number(v.frecuencia_mto || 15000);
                      const proximoServiceKm = ultimoMto + frecuencia;
                      const kmRestantes = proximoServiceKm - kmActual;
                      
                      const enAlerta = kmRestantes <= 2500;
                      const vencido = kmRestantes <= 0;

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: vencido ? '#fee2e2' : enAlerta ? '#fef9c3' : '#fff' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>{v.patente}</td>
                          <td style={{ padding: '10px' }}>{v.modelo}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: '#0284c7' }}>{kmActual}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{proximoServiceKm}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: '#b91c1c' }}>${Number(v.costo_mantenimiento || 0).toLocaleString()}</td>
                          <td style={{ padding: '10px' }}>
                            {vencido ? (
                              <span style={{ backgroundColor: '#b91c1c', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                ⚠️ ¡VENCIDO!
                              </span>
                            ) : enAlerta ? (
                              <span style={{ backgroundColor: '#ca8a04', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                🚨 ALERTA ({kmRestantes})
                              </span>
                            ) : (
                              <span style={{ backgroundColor: '#166534', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                ✅ En Vigencia
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 5: COMBUSTIBLE Y RENDIMIENTO */}
        {pestanaActiva === 'combustible' && !esChofer && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              ⛽ Registro y Control de Rendimiento de Combustible
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Carga los consumos de combustible por vehículo/unidad para analizar el gasto.
            </p>

            <div style={{ backgroundColor: idCargaEditando ? '#fef3c7' : '#f0fdf4', border: `1px solid ${idCargaEditando ? '#fde68a' : '#bbf7d0'}`, padding: '20px', borderRadius: '10px', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: idCargaEditando ? '#92400e' : '#15803d', fontSize: '16px' }}>
                {idCargaEditando ? '✏️ Modificar Carga de Combustible Seleccionada' : '📝 Cargar Nueva Carga de Combustible'}
              </h4>
              <form onSubmit={guardarCargaCombustible} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#166534' }}>Patente / Unidad:</label>
                  <select 
                    value={patenteCombustible} 
                    onChange={(e) => {
                      const pat = e.target.value;
                      setPatenteCombustible(pat);
                      const veh = flotaVehiculos.find(v => v.dominio === pat) || flotaMantenimientoBD.find(v => v.patente === pat);
                      if (veh && !idCargaEditando) setKmLecturaCombustible(veh.km || veh.horas || veh.km_actual || '');
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontWeight: 'bold' }}
                    required
                  >
                    <option value="">-- Seleccionar Patente --</option>
                    {listaTodasPatentes.map((pat, idx) => (
                      <option key={idx} value={pat}>{pat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#166534' }}>Litros Cargados:</label>
                  <input 
                    type="number" 
                    placeholder="Ej: 60" 
                    value={litrosCombustible} 
                    onChange={(e) => setLitrosCombustible(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#166534' }}>Importe Total ($):</label>
                  <input 
                    type="number" 
                    placeholder="Ej: 75000" 
                    value={importeCombustible} 
                    onChange={(e) => setImporteCombustible(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#166534' }}>Lectura Odómetro / Horas:</label>
                  <input 
                    type="number" 
                    placeholder="124500" 
                    value={kmLecturaCombustible} 
                    onChange={(e) => setKmLecturaCombustible(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: idCargaEditando ? '#d97706' : '#15803d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {idCargaEditando ? 'Guardar Cambios' : 'Registrar Carga'}
                  </button>
                  {idCargaEditando && (
                    <button 
                      type="button" 
                      onClick={() => { setIdCargaEditando(null); setPatenteCombustible(''); setLitrosCombustible(''); setImporteCombustible(''); setKmLecturaCombustible(''); }}
                      style={{ padding: '10px 12px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Filtrar por Patente:</label>
                <select 
                  value={filtroPatenteCombustible} 
                  onChange={(e) => setFiltroPatenteCombustible(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                >
                  <option value="">Todas las patentes</option>
                  {listaTodasPatentes.map((pat, idx) => (
                    <option key={idx} value={pat}>{pat}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={exportarCombustibleExcel}
                style={{ backgroundColor: '#15803d', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                📥 Exportar Cargas a Excel (.xlsx)
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                    <th style={{ padding: '10px' }}>Fecha</th>
                    <th style={{ padding: '10px' }}>Patente</th>
                    <th style={{ padding: '10px' }}>Modelo</th>
                    <th style={{ padding: '10px' }}>Litros</th>
                    <th style={{ padding: '10px' }}>Importe ($)</th>
                    <th style={{ padding: '10px' }}>Lectura Odómetro / Horas</th>
                    <th style={{ padding: '10px' }}>Costo/Ltr Estimado</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cargasCombustibleFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '15px', textAlign: 'center', color: '#64748b' }}>
                        No hay cargas registradas para el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    cargasCombustibleFiltradas.map((c, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', color: '#64748b' }}>{c.fecha}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>{c.patente}</td>
                        <td style={{ padding: '10px' }}>{c.modelo}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#15803d' }}>{c.litros} Lts</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>${c.importe.toLocaleString()}</td>
                        <td style={{ padding: '10px' }}>{c.kmLectura}</td>
                        <td style={{ padding: '10px', color: '#0369a1', fontWeight: 'bold' }}>${(c.importe / (c.litros || 1)).toFixed(2)}/L</td>
                        <td style={{ padding: '10px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                          <button onClick={() => editarCargaCombustible(c)} style={{ backgroundColor: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>✏️</button>
                          <button onClick={() => eliminarCargaCombustible(c.id)} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 6: CARNETS DE CHOFERES */}
        {pestanaActiva === 'choferesCarnets' && !esChofer && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              🪪 Gestión de Carnets y Documentación Obligatoria de Choferes
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Control de vencimientos.</p>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0369a1', fontSize: '16px' }}>📝 Registrar / Actualizar Vencimientos de Carnets</h4>
              <form onSubmit={guardarChoferCarnet} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Nombre Chofer:</label>
                  <input type="text" placeholder="Ej: Juan Pérez" value={nombreChoferCarnet} onChange={(e) => setNombreChoferCarnet(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>DNI:</label>
                  <input type="text" placeholder="Ej: 34567890" value={dniChoferCarnet} onChange={(e) => setDniChoferCarnet(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Teléfono:</label>
                  <input type="text" placeholder="Ej: 3874556677" value={telChoferCarnet} onChange={(e) => setTelChoferCarnet(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Carnet Conducir (Venc.):</label>
                  <input type="date" value={vencConducir} onChange={(e) => setVencConducir(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Cargas Peligrosas (Venc.):</label>
                  <input type="date" value={vencPeligrosas} onChange={(e) => setVencPeligrosas(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Cargas Generales (Venc.):</label>
                  <input type="date" value={vencGenerales} onChange={(e) => setVencGenerales(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Exámen Psicofísico (Venc.):</label>
                  <input type="date" value={vencPsicofisico} onChange={(e) => setVencPsicofisico(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0369a1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Guardar / Actualizar Carnets
                  </button>
                </div>
              </form>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                    <th style={{ padding: '10px' }}>Chofer</th>
                    <th style={{ padding: '10px' }}>DNI</th>
                    <th style={{ padding: '10px' }}>Carnet Conducir</th>
                    <th style={{ padding: '10px' }}>Cargas Peligrosas</th>
                    <th style={{ padding: '10px' }}>Cargas Generales</th>
                    <th style={{ padding: '10px' }}>Exámen Psicofísico</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {choferesCarnetsBD.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.nombre_chofer}</td>
                      <td style={{ padding: '10px' }}>{c.dni}</td>
                      <td style={{ padding: '10px' }}>{c.vencimiento_carnet_conducir ? c.vencimiento_carnet_conducir.slice(0, 10) : '-'}</td>
                      <td style={{ padding: '10px' }}>{c.vencimiento_cargas_peligrosas ? c.vencimiento_cargas_peligrosas.slice(0, 10) : '-'}</td>
                      <td style={{ padding: '10px' }}>{c.vencimiento_cargas_generales ? c.vencimiento_cargas_generales.slice(0, 10) : '-'}</td>
                      <td style={{ padding: '10px' }}>{c.vencimiento_psicofisico ? c.vencimiento_psicofisico.slice(0, 10) : '-'}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button type="button" onClick={() => editarChoferCarnet(c)} style={{ backgroundColor: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>✏️ Modificar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 7: ACTUALIZAR KM */}
        {pestanaActiva === 'actualizarKm' && !esChofer && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              ⏱️ Actualizar Lectura de Transporte (KM / Horas)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Selecciona cualquier vehículo.</p>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '20px', maxWidth: '650px' }}>
              <form onSubmit={actualizarKmRapido}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#92400e', marginBottom: '6px' }}>Seleccionar Unidad / Patente:</label>
                  <select value={patenteRapidaKm} onChange={(e) => setPatenteRapidaKm(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', fontWeight: 'bold' }} required>
                    <option value="">-- Selecciona una Patente --</option>
                    {listaTodasPatentes.map((pat, idx) => {
                      const obj = flotaVehiculos.find(v => v.dominio === pat) || flotaMantenimientoBD.find(v => v.patente === pat);
                      const lectura = obj?.km || obj?.horas || obj?.km_actual || 0;
                      return <option key={idx} value={pat}>🚘 {pat} ({obj?.modelo || 'Unidad'}) - Actual: {lectura}</option>;
                    })}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#92400e', marginBottom: '6px' }}>Nueva Lectura (KM / Horas de Trabajo):</label>
                  <input type="number" placeholder="Ej: 125000 o 1300" value={valorRapidoKm} onChange={(e) => setValorRapidoKm(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 'bold' }} required />
                </div>

                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                  ⚡ Actualizar Lectura en Todas las Pestañas
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* MODAL CIERRE PEDIDO */}
      {modalCierreAbierto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '550px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>Cierre de Parada y Viáticos</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Pedido #{pedidoACerrar?.id} - Cliente: <strong>{pedidoACerrar?.cliente || pedidoACerrar?.Cliente}</strong></p>

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
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>🏁 Cierre Final del Viaje (Regreso Hub)</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Ingresa el kilometraje final.</p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>Kilometraje Final (KM):</label>
            <input type="number" placeholder="Ej: 124890" value={kmFinalViajeSalta} onChange={(e) => setKmFinalViajeSalta(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', marginBottom: '20px' }} />

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