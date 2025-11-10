import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { CartDrawer } from '@/components/cart-drawer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Impactly - Shop Gift Cards, Create Real Impact',
  description: 'Every purchase supports causes you care about. Buy gift cards from your favorite brands and automatically contribute to verified charities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
