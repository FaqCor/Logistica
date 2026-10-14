// Arma el link wa.me con el resumen de ruta (el encargado toca "enviar")
const fmtFecha = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};
const fmtMonto = (n) =>
  Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function linkWhatsApp({ telefono, chofer, fecha, patente, pedidos, urlMapa }) {
  const tel = String(telefono || '').replace(/\D/g, '');
  const cabecera = `Hola ${chofer}, esta es tu ruta del ${fmtFecha(fecha)}.\nVehículo: ${patente}\n\nParadas:`;
  const pie = urlMapa ? `\n\nMapa con el recorrido:\n${urlMapa}` : '';
  const MAX = 1400; // los links muy largos fallan en algunos celulares
  let lineas = [];
  let usadas = 0;
  for (let i = 0; i < pedidos.length; i++) {
    const p = pedidos[i];
    const cobrar = Number(p.monto) > 0 ? ` (cobrar ${fmtMonto(p.monto)})` : '';
    const linea = `${i + 1}. ${p.cliente} - ${p.direccion}${cobrar}`;
    if ((cabecera + lineas.join('\n') + linea + pie).length > MAX) break;
    lineas.push(linea);
    usadas++;
  }
  let cuerpo = lineas.join('\n');
  if (usadas < pedidos.length) cuerpo += `\n...y ${pedidos.length - usadas} paradas más (ver mapa).`;
  const texto = `${cabecera}\n${cuerpo}${pie}`;
  return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
}
