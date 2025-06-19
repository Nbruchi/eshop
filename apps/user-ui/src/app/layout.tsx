import Header from '../shared/widgets/header/header';
import { Poppins } from 'next/font/google';
import Providers from './providers';
import './global.css';

export const metadata = {
  title: 'Eshop',
  description: 'Eshop',
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
      <body className={`${poppins.variable}`} suppressHydrationWarning={true}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
