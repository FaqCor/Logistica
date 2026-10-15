'use client';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function Panel({ email }) {
  // --- ESTADOS PARA LA IMPORTACIÓN DE EXCEL ---
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosExcel, setDatosExcel] = useState([]);
  const [importando, setImportando] = useState(false);

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

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Cabecera con título y botón de importación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Nueva ruta</h1>
        
        <div>
          <button 
            onClick={() => document.getElementById('inputExcelVentas').click()}
            style={{
              backgroundColor: '#047857',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
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

      {/* --- TARJETA DEL CHOFER ORIGINAL (RESTAURADA) --- */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: '#0f172a', color: '#fff', fontFamily: 'monospace', fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}>
              NEB732
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
              Juan Pérez
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', padding: '4px 10px', borderRadius: '12px', fontWeight: '500' }}>
              Sin checklist
            </span>
            <span style={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '12px', padding: '4px 10px', borderRadius: '12px', fontWeight: '500' }}>
              Planificada
            </span>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          0/0 entregados | Cobrado $0
        </p>

        <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '16px' }}>
          <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic', marginBottom: '12px' }}>
            Sin pedidos asignados.
          </p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <select style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', backgroundColor: '#fff' }}>
              <option value="">Agregar pedido sin asignar...</option>
            </select>
            <button style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              Agregar
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button style={{ padding: '10px 18px', backgroundColor: '#fde047', color: '#713f12', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Optimizar ruta
          </button>
          <button style={{ padding: '10px 18px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Enviar por WhatsApp
          </button>
        </div>
      </div>

      {/* --- MODAL DE PREVISUALIZACIÓN DE EXCEL --- */}
      {modalAbierto && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '700px', width: '90%' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>Vista Previa de Pedidos</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
              Se encontraron {datosExcel.length} pedidos en el archivo.
            </p>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '8px' }}>Cliente</th>
                    <th style={{ padding: '8px' }}>Dirección</th>
                    <th style={{ padding: '8px' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {datosExcel.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>{row.Cliente || row.cliente || '-'}</td>
                      <td style={{ padding: '8px' }}>{row.Direccion || row.dirección || '-'}</td>
                      <td style={{ padding: '8px' }}>${row.Monto || row.monto || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setModalAbierto(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarImportacion}
                disabled={importando}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#047857', color: 'white', cursor: 'pointer' }}
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