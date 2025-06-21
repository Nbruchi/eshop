import { Poppins } from 'next/font/google';
import Providers from './providers';
import './global.css';

export const metadata = {
  title: 'Eshop Seller',
  description: 'Eshop Seller Dashboard',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} min-h-screen bg-slate-900 font-Poppins antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
