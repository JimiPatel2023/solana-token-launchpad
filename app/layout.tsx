import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import WalletContextProvider from "@/components/WalletContextProvider";

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solana Token Launchpad',
  description: 'Launch and manage Solana tokens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.className} min-h-screen bg-[#0F172A] text-gray-100`}>
        <WalletContextProvider>
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <Navbar />
        <div className="relative">
          {children}
        </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
