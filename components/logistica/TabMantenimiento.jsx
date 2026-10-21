import React, { useState, useEffect } from 'react';

export default function TabMantenimiento() {
  const [patentes, setPatentes] = useState([]);
  const [patenteSeleccionada, setPatenteSeleccionada] = useState('');
  const [infoVehiculo, setInfoVehiculo] = useState({ modelo: '', kmActual: 0, tipoUnidad: 'km' });
  const [tipoMantenimiento, setTipoMantenimiento] = useState('Preventivo');
  const [descripcion, setDescripcion] = useState('');
  const [costo, setCosto] = useState('');
  const [historial, setHistorial] = useState([]);
  const [alertas, setAlertas] = useState([]);

  // Cargar lista de vehículos/patentes y mantenimientos al montar el componente
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      // Reemplaza con tus endpoints reales conectados a Neon
      const resFlota = await fetch('/api/flota'); 
      const dataFlota = await resFlota.json();
      setPatentes(dataFlota);

      const resMant = await fetch('/api/mantenimientos');
      const dataMant = await resMant.json();
      setHistorial(dataMant);
      evaluarAlertas(dataFlota, dataMant);
    } catch (error) {
      console.error("Error al cargar datos de mantenimiento:", error);
    }
  };

  // Al seleccionar una patente, autocompleta la última información
  const handleSeleccionarPatente = (e) => {
    const patente = e.target.value;
    setPatenteSeleccionada(patente);
    
    // Buscar en la flota el vehículo seleccionado (ejemplo de lógica)
    const vehiculoEncontrado = patentes.find(v => v.patente === patente);
    if (vehiculoEncontrado) {
      setInfoVehiculo({
        modelo: vehiculoEncontrado.modelo || 'No especificado',
        kmActual: vehiculoEncontrado.km_actual || vehiculoEncontrado.horas_actual || 0,
        tipoUnidad: vehiculoEncontrado.es_autoelevador ? 'Horas' : 'KM'
      });
    }
  };

  const handleGuardarMantenimiento = async (e) => {
    e.preventDefault();
    if (!patenteSeleccionada || !costo) {
      alert("Por favor seleccione una patente y desglose el costo.");
      return;
    }

    const nuevoRegistro = {
      patente: patenteSeleccionada,
      tipo_mantenimiento: tipoMantenimiento,
      descripcion_trabajo: descripcion,
      costo: parseFloat(costo),
      km_o_horas_actual: infoVehiculo.kmActual,
      proximo_mantenimiento_km: Number(infoVehiculo.kmActual) + 10000 // Ejemplo de intervalo
    };

    try {
      const res = await fetch('/api/mantenimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoRegistro)
      });

      if (res.ok) {
        alert("Mantenimiento registrado y guardado en Neon exitosamente.");
        setDescripcion('');
        setCosto('');
        cargarDatosIniciales();
      } else {
        alert("Error al guardar en la base de datos.");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  const evaluarAlertas = (flotaData, mantData) => {
    // Lógica para detectar vehículos próximos a mantenimiento
    const listaAlertas = [];
    flotaData.forEach(vehiculo => {
      // Supongamos un límite de mantenimiento cada 10,000 km o horas
      const limite = 10000;
      const actual = vehiculo.km_actual || 0;
      if (actual % limite > 8500) {
        listaAlertas.push(`⚠️ El vehículo ${vehiculo.patente} (${vehiculo.modelo}) está próximo a servicio (${actual} ${vehiculo.es_autoelevador ? 'horas' : 'km'}).`);
      }
    });
    setAlertas(listaAlertas);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Control de Mantenimiento Preventivo y Correctivo</h2>
      
      {/* Formulario de Carga */}
      <form onSubmit={handleGuardarMantenimiento} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Patente (Flota)</label>
          <select 
            value={patenteSeleccionada} 
            onChange={handleSeleccionarPatente}
            className="w-full mt-1 p-2 border rounded-md"
            required
          >
            <option value="">Seleccione una patente...</option>
            {patentes.map((v, index) => (
              <option key={index} value={v.patente}>{v.patente} - {v.modelo}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Modelo y Estado Actual</label>
          <input 
            type="text" 
            readOnly 
            value={`${infoVehiculo.modelo} | Actual: ${infoVehiculo.kmActual} ${infoVehiculo.tipoUnidad}`} 
            className="w-full mt-1 p-2 bg-gray-100 border rounded-md text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Mantenimiento</label>
          <select 
            value={tipoMantenimiento} 
            onChange={(e) => setTipoMantenimiento(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md"
          >
            <option value="Preventivo">Preventivo</option>
            <option value="Correctivo">Correctivo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Costo del Reparación ($)</label>
          <input 
            type="number" 
            step="0.01" 
            value={costo} 
            onChange={(e) => setCosto(e.target.value)}
            placeholder="Ej: 45000"
            className="w-full mt-1 p-2 border rounded-md"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Descripción del Trabajo / Repuestos</label>
          <textarea 
            value={descripcion} 
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles del mantenimiento realizado..."
            className="w-full mt-1 p-2 border rounded-md"
            rows="2"
          />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition">
            Registrar y Guardar en Neon
          </button>
        </div>
      </form>

      {/* Sección Inferior: Reporte y Alertas Automáticas */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Estado de Alertas y Reportes de Flota</h3>
        {alertas.length > 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            {alertas.map((alerta, idx) => (
              <p key={idx} className="text-yellow-700 text-sm font-medium">{alerta}</p>
            ))}
          </div>
        ) : (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <p className="text-green-700 text-sm font-medium">✅ Toda la flota se encuentra en óptimas condiciones de mantenimiento.</p>
          </div>
        )}
      </div>
    </div>
  );
}