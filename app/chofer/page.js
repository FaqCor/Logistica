import { redirect } from 'next/navigation';
import { sesionActual } from '@/lib/auth';
import ChoferApp from '@/components/chofer/ChoferApp';

export default async function PaginaChofer() {
  const s = await sesionActual();
  if (!s || s.rol !== 'chofer') redirect('/login');
  return <ChoferApp />;
}
