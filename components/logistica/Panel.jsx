'use client';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function Panel({ email }) {
  // --- ESTADOS PARA LA IMPORTACIÓN DE EXCEL ---
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosExcel, setDatosExcel] = useState([]);
  const [importando, setImportando] = useState(false);

  // --- ESTADOS PARA LA GESTIÓN DE RUTA Y PEDIDOS ---
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState('');
  const [pedidosAsignados, setPedidosAsignados] = useState([]);

  // Cargar el archivo Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setDatosExcel(data);
      setModalAbierto(true);
    };
    reader.readAsBinaryString(file);
  };

  // Guardar datos en Neon
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
        setDatosExcel([]);
        window.location.reload();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Hubo un error al conectar con el servidor.');
    } finally {
      setImportando(false);
    }
  };

  // Agregar pedido seleccionado a la lista asignada
  const handleAgregarPedido = () => {
    if (!pedidoSeleccionado) return;
    setPedidosAsignados([...pedidosAsignados, pedidoSeleccionado]);
    setPedidoSeleccionado('');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* CABECERA: TÍTULO Y BOTÓN IMPORTAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>Nueva ruta</h1>
        
        <div>
          <button 
            onClick={() => document.getElementById('inputExcelVentas').click()}
            style={{
              backgroundColor: '#047857',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📊 Importar Excel de Ventas
          </button>
          <input 
            type="file" 
            id="inputExcelVentas" 
            accept=".xlsx, .xls, .csv" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
          />
        </div>
      </div>

      {/* TARJETA DEL CHOFER (CON TODOS LOS BOTONES Y DESPLEGABLES) */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        
        {/* FILA SUPERIOR: DOMINIO, CHOFER Y INSIGNIAS DE ESTADO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ backgroundColor: '#0f172a', color: '#fff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
              NEB732
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
              Juan Pérez
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', padding: '4px 12px', borderRadius: '16px', fontWeight: '500' }}>
              Sin checklist
            </span>
            <span style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '12px', padding: '4px 12px', borderRadius: '16px', fontWeight: '500' }}>
              Planificada
            </span>
          </div>
        </div>

        {/* METRICAS DE ENTREGAS Y COBRO */}
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
          {pedidosAsignados.length}/0 entregados | Cobrado $0
        </p>

        {/* SECCIÓN DE ASIGNACIÓN DE PEDIDOS */}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
          {pedidosAsignados.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px' }}>
              Sin pedidos asignados.
            </p>
          ) : (
            <ul style={{ paddingLeft: '20px', marginBottom: '12px', fontSize: '14px', color: '#334155' }}>
              {pedidosAsignados.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}

          {/* SELECTOR Y BOTÓN AGREGAR */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={pedidoSeleccionado}
              onChange={(e) => setPedidoSeleccionado(e.target.value)}
              style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', backgroundColor: '#fff', color: '#334155', outline: 'none' }}
            >
              <option value="">Agregar pedido sin asignar...</option>
              <option value="Pedido #001 - Cliente Ejemplo SRL">Pedido #001 - Cliente Ejemplo SRL</option>
              <option value="Pedido #002 - Distribuidora Norte">Pedido #002 - Distribuidora Norte</option>
            </select>
            
            <button 
              onClick={handleAgregarPedido}
              style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
            >
              Agregar
            </button>
          </div>
        </div>

        {/* BOTONES ACCIONADORES: OPTIMIZAR RUTA Y ENVIAR POR WHATSAPP */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button style={{ padding: '12px 24px', backgroundColor: '#facc15', color: '#713f12', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Optimizar ruta
          </button>
          <button style={{ padding: '12px 24px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Enviar por WhatsApp
          </button>
        </div>

      </div>

      {/* MODAL DE PREVISUALIZACIÓN DE EXCEL */}
      {modalAbierto && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '700px', width: '90%' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>Vista Previa de Pedidos</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              Se encontraron {datosExcel.length} pedidos en el archivo.
            </p>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px' }}>Cliente</th>
                    <th style={{ padding: '10px' }}>Dirección</th>
                    <th style={{ padding: '10px' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {datosExcel.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px' }}>{row.Cliente || row.cliente || '-'}</td>
                      <td style={{ padding: '10px' }}>{row.Direccion || row.dirección || '-'}</td>
                      <td style={{ padding: '10px' }}>${row.Monto || row.monto || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setModalAbierto(false)}
                style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarImportacion}
                disabled={importando}
                style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#047857', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              >
                {importando ? 'Guardando...' : 'Confirmar e Importar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}