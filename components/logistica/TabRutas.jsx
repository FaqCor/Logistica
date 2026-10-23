'use client';
import React, { useState, useEffect } from 'react';

export default function TabAsignacion() {
  const [choferes, setChoferes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  
  const [choferSeleccionado, setChoferSeleccionado] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState('');
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState({});
  const [montosACobrar, setMontosACobrar] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // 1. Cargar Choferes de Personal
      const resChoferes = await fetch('/api/personal', { cache: 'no-store' });
      if (resChoferes.ok) {
        const data = await resChoferes.json();
        setChoferes(Array.isArray(data) ? data : data.personal || []);
      }

      // 2. Cargar Vehículos de Flota
      const resFlota = await fetch('/api/flota', { cache: 'no-store' });
      if (resFlota.ok) {
        const data = await resFlota.json();
        setVehiculos(Array.isArray(data) ? data : data.flota || []);
      }

      // 3. Cargar Pedidos Pendientes de la BD
      const resPedidos = await fetch('/api/pedidos', { cache: 'no-store' });
      if (resPedidos.ok) {
        const data = await resPedidos.json();
        const lista = Array.isArray(data) ? data : data.pedidos || [];
        setPedidosPendientes(lista);

        // Inicializar montos a cobrar por cada pedido
        const inicialMontos = {};
        lista.forEach(p => {
          inicialMontos[p.id || p.n_pedido] = p.monto_a_cobrar || 0;
        });
        setMontosACobrar(inicialMontos);
      }
    } catch (error) {
      console.error("Error al cargar datos de asignación:", error);
    }
    setCargando(false);
  };

  const handleCheckboxChange = (pedidoId) => {
    setPedidosSeleccionados(prev => ({
      ...prev,
      [pedidoId]: !prev[pedidoId]
    }));
  };

  const handleMontoChange = (pedidoId, valor) => {
    setMontosACobrar(prev => ({
      ...prev,
      [pedidoId]: valor
    }));
  };

  const handleAnadirRuta = async () => {
    if (!choferSeleccionado || !vehiculoSeleccionado) {
      alert("Por favor seleccione un Chofer y un Vehículo antes de asignar la ruta.");
      return;
    }

    const seleccionados = pedidosPendientes.filter(p => pedidosSeleccionados[p.id || p.n_pedido]);

    if (seleccionados.length === 0) {
      alert("Por favor seleccione al menos un pedido/cliente para añadir a la ruta.");
      return;
    }

    // Mapear con el monto a cobrar ingresado manualmente
    const pedidosAProcesar = seleccionados.map(p => ({
      ...p,
      monto_a_cobrar: parseFloat(montosACobrar[p.id || p.n_pedido]) || 0
    }));

    try {
      const res = await fetch('/api/envios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chofer_nombre: choferSeleccionado,
          vehiculo: vehiculoSeleccionado,
          pedidosSeleccionados: pedidosAProcesar
        })
      });

      if (res.ok) {
        alert("Ruta asignada y guardada en Neon exitosamente.");
        setPedidosSeleccionados({});
        cargarDatos();
      } else {
        alert("Error al guardar la asignación.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📋 Asignación de Pedidos y Rutas
      </h2>

      {cargando ? (
        <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando datos de logística...</p>
      ) : (
        <>
          {/* Contenedor de Selectores */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#1e293b', marginBottom: '6px' }}>
                Seleccionar Chofer:
              </label>
              <select
                value={choferSeleccionado}
                onChange={(e) => setChoferSeleccionado(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="">Seleccione un chofer...</option>
                {choferes.map((c, idx) => (
                  <option key={idx} value={c.nombre || c.chofer_nombre}>{c.nombre || c.chofer_nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#1e293b', marginBottom: '6px' }}>
                Seleccionar Vehículo:
              </label>
              <select
                value={vehiculoSeleccionado}
                onChange={(e) => setVehiculoSeleccionado(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="">Seleccione un vehículo...</option>
                {vehiculos.map((v, idx) => {
                  const pat = v.dominio || v.patente;
                  return (
                    <option key={idx} value={`${pat} - ${v.modelo || ''}`}>
                      {pat} - {v.modelo || 'Vehículo'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Lista de Envíos Pendientes e Ingreso de Monto a Cobrar */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>
              ☑️ Seleccionar envíos pendientes para asignar {choferSeleccionado ? `a ${choferSeleccionado}` : ''}:
            </h3>

            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pedidosPendientes.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>No hay pedidos pendientes para asignar.</p>
              ) : (
                pedidosPendientes.map((p) => {
                  const pId = p.id || p.n_pedido;
                  const isChecked = !!pedidosSeleccionados[pId];

                  return (
                    <div
                      key={pId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#fff',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(pId)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '13px', color: '#334155' }}>
                          <strong>#{p.n_pedido || pId}</strong> - ({p.cliente || 'Cliente'}) - ({p.provincia || 'N/A'}) | 📍 {p.direccion || 'Sin dirección'} (Bultos: {p.bultos || 0})
                        </span>
                      </div>

                      {/* Campo para ingresar el Monto a Cobrar por Cliente */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#047857' }}>A Cobrar ($):</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={montosACobrar[pId] !== undefined ? montosACobrar[pId] : ''}
                          onChange={(e) => handleMontoChange(pId, e.target.value)}
                          disabled={!isChecked}
                          style={{
                            width: '110px',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: '1px solid #059669',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: '#047857',
                            background: isChecked ? '#f0fdf4' : '#f1f5f9'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAnadirRuta}
              style={{
                background: '#047857',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ➕ Añadir Ruta con los pedidos seleccionados
            </button>
          </div>
        </>
      )}
    </div>
  );
}