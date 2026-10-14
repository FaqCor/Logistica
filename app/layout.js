import { Barlow, Barlow_Condensed } from 'next/font/google';
import './globals.css';

const cuerpo = Barlow({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-cuerpo' });
const titulo = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--f-titulo' });

export const metadata = { title: 'Logística', description: 'Gestión de choferes, rutas y entregas' };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f4d3a' };

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${cuerpo.variable} ${titulo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
