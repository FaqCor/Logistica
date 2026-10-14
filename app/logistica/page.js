import { redirect } from 'next/navigation';
import { sesionActual } from '@/lib/auth';
import Panel from '@/components/logistica/Panel';

export default async function PaginaLogistica() {
  const s = await sesionActual();
  if (!s || s.rol === 'chofer') redirect('/login');
  return <Panel email={s.email} />;
}
