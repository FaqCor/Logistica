import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

// Fecha de hoy (YYYY-MM-DD) en la zona horaria de la operación
export function hoyAR() {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: process.env.TZ_APP || 'America/Argentina/Buenos_Aires',
  });
}
