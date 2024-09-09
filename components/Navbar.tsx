'use client'

import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from 'framer-motion'
import { ArrowRightCircleIcon, CheckCircleIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {

    const { wallet, disconnect, connected, connecting, disconnecting} = useWallet();

    const { setVisible } = useWalletModal();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (connected && wallet?.adapter?.publicKey) {
      setWalletAddress(wallet.adapter.publicKey.toBase58().slice(0, 4) + '...' + wallet.adapter.publicKey.toBase58().slice(-4));
    } else {
      setWalletAddress(null);
    }
  }, [connected, wallet]);

  const handleClick = async () => {
    if (connected) {
      await disconnect();
    } else {
      setVisible(true);
    }
  };
  return (
    <nav className="bg-[#1E293B]/50 backdrop-blur-xl border-b border-[#3730A3]/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={"/"} className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          SolanaLaunch
        </Link>
        <motion.button
          className="px-6 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
        >
          {connecting ? (
        <div className="flex items-center gap-2 justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Connecting...</span>
        </div>
      ) : disconnecting ? (
        <div className="flex items-center gap-2 justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Disconnecting...</span>
        </div>
      ) : connected ? (
        <div className="flex items-center gap-2 justify-center">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span>{walletAddress}</span>
          <ArrowRightCircleIcon className="h-4 w-4 ml-2" />
        </div>
      ) : (
        <div className="flex items-center gap-2 justify-center">
          <WalletIcon className="h-5 w-5" />
          <span>Connect Wallet</span>
        </div>
      )}
        </motion.button>
      </div>
    </nav>
  )
}