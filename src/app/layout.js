import './globals.css';

export const metadata = {
  title: 'Ecos de Amor',
  description: 'Un espacio creado con amor para ti',
  icons: { icon: '/Icono.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}