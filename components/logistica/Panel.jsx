'use client';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function PanelLogistica() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosExcel, setDatosExcel] = useState([]);
  const [importando, setImportando] = useState(false);

  // 1. Manejar la selección del archivo Excel
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

  // 2. Enviar los datos procesados a la API para guardarlos en Neon
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
        window.location.reload(); // Recarga para ver los pedidos reflejados
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error al conectar con el servidor.');
    } finally {
      setImportando(false);
    }
  };

  // 3. Descargar plantilla modelo de Excel
  const descargarPlantilla = () => {
    const plantilla = [
      { Cliente: "Cliente Ejemplo SRL", Direccion: "Mitre 123", Localidad: "Salta", Telefono: "3874000000", Detalle: "10 Cajas", Monto: 25000 }
    ];
    const ws = XLSX.utils.json_to_sheet(plantilla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_pedidos.xlsx");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Nueva ruta - Gestión Logística</h1>
        
        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={descargarPlantilla}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            📥 Descargar Plantilla Excel
          </button>

          <button 
            onClick={() => document.getElementById('inputExcelVentas').click()}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            📊 Importar Excel de Ventas
          </button>
          <input 
            type="file" 
            id="inputExcelVentas" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
        </div>
      </div>

      {/* Tarjeta del Chofer (Basada en tu diseño original) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="bg-slate-900 text-white font-mono text-xs px-2.5 py-1 rounded">NEB732</span>
            <h2 className="text-lg font-bold text-gray-800">Juan Pérez</h2>
          </div>
          <div className="flex gap-2">
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-3 py-1 rounded-full font-medium">Sin checklist</span>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs px-3 py-1 rounded-full font-medium">Planificada</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">0/0 entregados | Cobrado $0</p>

        <div className="border-t border-dashed border-gray-200 pt-4">
          <p className="text-sm text-gray-400 italic mb-3">Sin pedidos asignados.</p>
          <div className="flex gap-3">
            <select className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Agregar pedido sin asignar...</option>
            </select>
            <button className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
              Agregar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button className="px-5 py-2.5 bg-amber-300 hover:bg-amber-400 text-amber-950 font-medium rounded-lg text-sm transition-colors shadow-sm">
            Optimizar ruta
          </button>
          <button className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white font-medium rounded-lg text-sm transition-colors shadow-sm">
            Enviar por WhatsApp
          </button>
        </div>
      </div>

      {/* MODAL DE VISTA PREVIA DEL EXCEL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Vista Previa de Pedidos</h3>
            <p className="text-sm text-gray-500 mb-4">Se encontraron <strong>{datosExcel.length}</strong> registros listos para importar desde el archivo.</p>
            
            <div className="overflow-x-auto flex-1 border border-gray-200 rounded-xl mb-6 shadow-inner max-h-[400px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="p-3 text-gray-600 font-semibold">Cliente</th>
                    <th className="p-3 text-gray-600 font-semibold">Dirección</th>
                    <th className="p-3 text-gray-600 font-semibold">Localidad</th>
                    <th className="p-3 text-gray-600 font-semibold">Teléfono</th>
                    <th className="p-3 text-gray-600 font-semibold">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {datosExcel.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-3 font-medium text-gray-800">{row.Cliente || row.cliente || '-'}</td>
                      <td className="p-3 text-gray-600">{row.Direccion || row.dirección || row.Dirección || '-'}</td>
                      <td className="p-3 text-gray-600">{row.Localidad || row.localidad || 'Salta'}</td>
                      <td className="p-3 text-gray-600">{row.Telefono || row.teléfono || '-'}</td>
                      <td className="p-3 text-emerald-700 font-semibold">${row.Monto || row.monto || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button 
                onClick={() => setModalAbierto(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarImportacion}
                disabled={importando}
                className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-medium hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {importando ? 'Guardando en Base de Datos...' : 'Confirmar e Importar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}