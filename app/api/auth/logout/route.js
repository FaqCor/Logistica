import { borrarSesion } from '@/lib/auth';
import { ok } from '@/lib/api';

export async function POST() {
  borrarSesion();
  return ok();
}
