/**
 * Google Apps Script - Logística
 *
 * Hace DOS cosas:
 *  1) sincronizar(): trae los datos de la app (Neon) y los escribe en las pestañas
 *     Costos (ordenada por patente), Resumen por patente, Cobros y Pedidos.
 *  2) doPost(): optimizador de rutas. La app le manda el depósito y las paradas y
 *     recibe el orden óptimo calculado con Google Maps.
 *
 * INSTALACIÓN: ver README.md, sección "Google Sheets y optimizador".
 */

const CONFIG = {
  APP_URL: 'https://TU-APP.vercel.app',           // URL pública de la app
  SHEETS_TOKEN: 'PEGAR_EL_MISMO_VALOR_DE_SHEETS_TOKEN',
  OPTIMIZER_TOKEN: 'PEGAR_EL_MISMO_VALOR_DE_APPS_SCRIPT_TOKEN',
};

// ---------- 1) SINCRONIZACIÓN A GOOGLE SHEETS ----------

function sincronizar() {
  const url = CONFIG.APP_URL + '/api/sheets/export?token=' + encodeURIComponent(CONFIG.SHEETS_TOKEN);
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    throw new Error('La app respondió ' + res.getResponseCode() + ': ' + res.getContentText());
  }
  const d = JSON.parse(res.getContentText());

  // Costos: ordenada por patente y luego por fecha
  const costos = d.costos.slice().sort(function (a, b) {
    return a.patente.localeCompare(b.patente) || a.fecha.localeCompare(b.fecha);
  });
  escribir_('Costos', ['Patente', 'Fecha', 'Concepto', 'Monto', 'Detalle'],
    costos.map(function (r) { return [r.patente, r.fecha, r.concepto, Number(r.monto), r.detalle || '']; }),
    { monto: 4 });

  escribir_('Resumen por patente', ['Patente', 'Mes', 'Costo total'],
    d.resumen.map(function (r) { return [r.patente, r.mes.slice(0, 7), Number(r.costo_total)]; }),
    { monto: 3 });

  escribir_('Cobros', ['Fecha', 'Patente', 'Cliente', 'Pedido', 'Pago Nº', 'Medio', 'Monto', 'Referencia'],
    d.cobros.map(function (r) { return [r.fecha, r.patente || '', r.cliente, r.nro_pedido, r.orden || '', r.medio || '', Number(r.monto || 0), r.referencia || '']; }),
    { monto: 7 });

  escribir_('Pedidos', ['Fecha', 'Patente', 'Chofer', 'Pedido', 'Cliente', 'Dirección', 'Estado', 'Motivo no entrega', 'Monto a cobrar'],
    d.pedidos.map(function (r) { return [r.fecha, r.patente || '', r.chofer || '', r.nro_pedido, r.cliente, r.direccion, r.estado, r.motivo_no_entrega || '', Number(r.monto)]; }),
    { monto: 9 });
}

function escribir_(nombre, encabezados, filas, formato) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  hoja.clearContents();
  hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados])
    .setFontWeight('bold').setBackground('#0f4d3a').setFontColor('#ffffff');
  hoja.setFrozenRows(1);
  if (filas.length) {
    hoja.getRange(2, 1, filas.length, encabezados.length).setValues(filas);
    if (formato && formato.monto) {
      hoja.getRange(2, formato.monto, filas.length, 1).setNumberFormat('$ #,##0');
    }
  }
  hoja.autoResizeColumns(1, encabezados.length);
}

// Ejecutar UNA vez a mano para que se sincronice sola cada 15 minutos
function instalarTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sincronizar') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sincronizar').timeBased().everyMinutes(15).create();
}

// ---------- 2) OPTIMIZADOR DE RUTAS (Web App) ----------

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.token !== CONFIG.OPTIMIZER_TOKEN) return json_({ error: 'token inválido' });

    const paradas = body.paradas || [];   // [{ id, direccion }]
    if (!paradas.length) return json_({ error: 'sin paradas' });
    if (paradas.length > 24) return json_({ error: 'Google Maps admite hasta 24 paradas por ruta' });

    const volver = body.volver !== false;
    const destino = volver ? body.origen : paradas[paradas.length - 1].direccion;
    const intermedias = volver ? paradas : paradas.slice(0, -1);

    let orden = paradas.map(function (p) { return p.id; });
    let km = 0, minutos = 0;

    if (intermedias.length > 0) {
      const finder = Maps.newDirectionFinder()
        .setOrigin(body.origen)
        .setDestination(destino)
        .setOptimizeWaypoints(true)
        .setMode(Maps.DirectionFinder.Mode.DRIVING);
      intermedias.forEach(function (p) { finder.addWaypoint(p.direccion); });

      const r = finder.getDirections();
      if (r.status !== 'OK') return json_({ error: 'Maps respondió ' + r.status + '. Revisá las direcciones.' });

      const ruta = r.routes[0];
      orden = ruta.waypoint_order.map(function (i) { return intermedias[i].id; });
      if (!volver) orden.push(paradas[paradas.length - 1].id);
      ruta.legs.forEach(function (l) { km += l.distance.value / 1000; minutos += l.duration.value / 60; });
    }
    return json_({ orden: orden, km: km, minutos: minutos });
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
