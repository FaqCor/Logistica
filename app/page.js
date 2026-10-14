import { redirect } from 'next/navigation';
import { sesionActual, destinoPorRol } from '@/lib/auth';

export default async function Inicio() {
  const s = await sesionActual();
  redirect(s ? destinoPorRol(s.rol) : '/login');
}
