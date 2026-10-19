'use client';
import React, { useState } from 'react';
import Pedidos from './Pedidos';

export default function ChoferApp({
  emailChofer,
  pedidosAsignados = [],
  vehiculoAsignado = 'NEB732',
  setModalCierreAbierto,
  setPedidoACerrar,
  setModalCierreFinalViaje,
  checklistEnviado,
  setChecklistEnviado
}) {
  const [modalIncidenciaAbierto, setModalIncidenciaAbierto] = useState(false);
  const [motivoIncidencia, setMotivoIncidencia] = useState('');

  const registrarIncidencia = (e) => {
    e.preventDefault();
    if (!motivoIncidencia) return alert('Ingresa el motivo de la incidencia.');
    alert('🚨 Incidencia reportada a la central de logística con éxito.');
    setMotivoIncidencia('');
    setModalIncidenciaAbierto(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '12px', fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      
      {/* HEADER DE LA CABINA */}
      <div style={{ backgroundColor: '#064e3b', color: '#ffffff', padding: '16px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: 'bold' }}>🚚 Modo Chofer - Unidad en Ruta</span>
          <span style={{ backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '900', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }}>
            {vehiculoAsignado}
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
          {emailChofer || 'Chofer Asignado'}
        </h2>
        <span style={{ fontSize: '12px', color: '#d1fae5' }}>Base Operativa: Maestro Pedernera 1217</span>
      </div>

      {/* BOTÓN DE FINALIZAR JORNADA EN HUB */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setModalCierreFinalViaje(true)}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          🏁 Finalizar Viaje del Día (Cierre de Odómetro en Hub)
        </button>
      </div>

      {/* LISTA DE PEDIDOS ASIGNADOS CON GOOGLE MAPS */}
      <Pedidos
        pedidos={pedidosAsignados}
        setPedidoACerrar={setPedidoACerrar}
        setModalCierreAbierto={setModalCierreAbierto}
        setModalIncidenciaAbierto={() => setModalIncidenciaAbierto(true)}
      />

      {/* MODAL REPORTAR INCIDENCIA */}
      {modalIncidenciaAbierto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#b91c1c', fontSize: '18px' }}>🚨 Reportar Incidencia en Ruta</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              Informa cualquier problema con el paquete, cliente ausente o demoras en la entrega.
            </p>

            <form onSubmit={registrarIncidencia}>
              <textarea
                rows="4"
                placeholder="Ej: Cliente ausente en el domicilio o dirección incorrecta..."
                value={motivoIncidencia}
                onChange={(e) => setMotivoIncidencia(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '16px' }}
                required
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setModalIncidenciaAbierto(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Enviar Alerta a Logística
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}