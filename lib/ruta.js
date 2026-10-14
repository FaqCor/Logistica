// Arma el link de Google Maps con las paradas en el orden indicado
export function urlMapa(origen, direcciones) {
  if (!direcciones.length) return null;
  const volver = Boolean(origen) && process.env.RUTA_VOLVER_AL_DEPOSITO !== 'false';
  const p = new URLSearchParams({ api: '1', travelmode: 'driving' });
  if (origen) p.set('origin', origen);
  if (volver) {
    p.set('destination', origen);
    p.set('waypoints', direcciones.join('|'));
  } else {
    p.set('destination', direcciones[direcciones.length - 1]);
    if (direcciones.length > 1) p.set('waypoints', direcciones.slice(0, -1).join('|'));
  }
  return 'https://www.google.com/maps/dir/?' + p.toString();
}
