'use client';
import React, { useState } from 'react';

export default function ChecklistTransporte({ patente, choferNombre, tipoRegistro, onComplete }) {
  const [checklist, setChecklist] = useState({
    cabina_limpia: 'OK',
    luces_tablero: 'OK',
    cinturones: 'OK',
    limpiaparabrisas: 'OK',
    espejos: 'OK',
    bocina: 'OK',
    aire_acondicionado: 'OK',
    calefaccion: 'OK',
    carroceria: 'OK',
    luces_altas: 'OK',
    luces_bajas: 'OK',
    luces_posicion: 'OK',
    luces_giro_delant: 'OK',
    luces_freno: 'OK',
    luces_reversa: 'OK',
    luces_giro_tras: 'OK',
    neumaticos_delant: 'OK',
    neumaticos_tras: 'OK',
    cierre_puertas: 'OK',
    cierre_baul: 'OK',
    cierre_compuertas: 'OK'
  });

  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleToggle = (key) => {
    setChecklist(prev => ({
      ...prev,
      [key]: prev[key] === 'OK' ? 'DEFECTUOSO' : 'OK'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patente_vehiculo: patente,
          tipo_registro: tipoRegistro,
          ...checklist,
          observaciones
        })
      });
      const data = await response.json();
      if (data.success) {
        onComplete();
      } else {
        alert('Error al guardar en Neon: ' + (data.error || 'Intente nuevamente'));
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar el checklist.');
    } finally {
      setGuardando(false);
    }
  };

  const secciones = [
    {
      titulo: '1. HABITÁCULO Y CONTROL INTERIOR',
      items: [
        { key: 'cabina_limpia', label: '¿La cabina se encuentra limpia y desinfectada?' },
        { key: 'luces_tablero', label: 'Funcionamiento de luces de tablero y alertas' },
        { key: 'cinturones', label: 'Ajustes y estado de cinturones de seguridad' },
        { key: 'limpiaparabrisas', label: 'Funcionamiento de limpia parabrisas y agua' },
        { key: 'espejos', label: 'Espejos retrovisores (interiores y exteriores)' },
        { key: 'bocina', label: 'Funcionamiento de bocina' },
        { key: 'aire_acondicionado', label: 'Funcionamiento de aire acondicionado' },
        { key: 'calefaccion', label: 'Funcionamiento de calefacción' }
      ]
    },
    {
      titulo: '2. ESTADO EXTERIOR Y LUCES',
      items: [
        { key: 'carroceria', label: 'Estado de la carrocería (Sin golpes ni rayones graves)' },
        { key: 'luces_altas', label: 'Luces delanteras altas' },
        { key: 'luces_bajas', label: 'Luces delanteras bajas' },
        { key: 'luces_posicion', label: 'Luces delanteras de posición' },
        { key: 'luces_giro_delant', label: 'Luces delanteras de giro' },
        { key: 'luces_freno', label: 'Luces traseras de freno' },
        { key: 'luces_reversa', label: 'Luces trasera de reversa' },
        { key: 'luces_giro_tras', label: 'Luces trasera de giro' },
        { key: 'neumaticos_delant', label: 'Presión y estado de neumáticos delanteros' },
        { key: 'neumaticos_tras', label: 'Presión y estado de neumáticos traseros' },
        { key: 'cierre_puertas', label: 'Cierre correcto de puertas' },
        { key: 'cierre_baul', label: 'Cierre correcto de baúl' },
        { key: 'cierre_compuertas', label: 'Cierre correcto de compuertas de cargas' }
      ]
    }
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0' }}>
      {/* DATOS ASIGNADOS NO EDITABLES */}
      <div style={{ backgroundColor: '#f1f5f9', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', border: '1px solid #cbd5e1' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Chofer:</span>
          <strong style={{ fontSize: '16px', color: '#0f172a' }}>👤 {choferNombre || 'Juan Pérez'}</strong>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Vehículo / Transporte Asignado:</span>
          <strong style={{ fontSize: '16px', color: '#047857' }}>🚚 Patente: {patente}</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {secciones.map((sec, idx) => (
          <div key={idx} style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0369a1', marginBottom: '12px', borderBottom: '2px solid #e0f2fe', paddingBottom: '6px' }}>
              {sec.titulo}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sec.items.map((item) => {
                const isOk = checklist[item.key] === 'OK';
                return (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{item.label}</span>
                    <button
                      type="button"
                      onClick={() => handleToggle(item.key)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: isOk ? '#16a34a' : '#dc2626'
                      }}
                    >
                      {isOk ? '👍 OK' : '👎 Defectuoso'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            Observaciones o novedades para el Encargado de Logística:
          </label>
          <textarea
            rows="3"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Escribe aquí cualquier observación sobre el vehículo..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={guardando}
          style={{
            width: '100%',
            backgroundColor: guardando ? '#94a3b8' : '#047857',
            color: '#ffffff',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: guardando ? 'not-allowed' : 'pointer'
          }}
        >
          {guardando ? 'Guardando en Neon...' : '💾 Enviar Checklist y Ver Envíos'}
        </button>
      </form>
    </div>
  );
}