"use client"
import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import TokenCard from '@/components/TokenCard'
import { PublicKey } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, getMint, getAccount, TokenAccountNotFoundError } from "@solana/spl-token"
import { showToast } from '@/components/CustomToast'
import { FaSpinner } from 'react-icons/fa'
import Link from "next/link"

interface TokenHolding {
  name: string
  symbol: string
  address: string
  balance: number
  decimals: number
  image?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
}

export default function MyTokenHoldings() {
  const [holdings, setHoldings] = useState<TokenHolding[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast("Address copied to clipboard!", "success")
    } catch (err) {
      console.error('Failed to copy: ', err)
      showToast("Failed to copy address", "error")
    }
  }

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!publicKey) return

      setIsLoading(true)
      try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, { programId: TOKEN_2022_PROGRAM_ID })

        const fetchedHoldings = await Promise.all(
          tokenAccounts.value.map(async ({ pubkey, account }) => {
            try {
              const accountInfo = await getAccount(connection, pubkey, undefined, TOKEN_2022_PROGRAM_ID)
              const mintInfo = await getMint(connection, accountInfo.mint, undefined, TOKEN_2022_PROGRAM_ID)
              
              // Only include tokens with non-zero balance
              if (accountInfo.amount > 0) {
                const balance = Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals)
                return {
                  name: mintInfo.name || 'Unknown Token',
                  symbol: mintInfo.symbol || 'UNKNOWN',
                  address: accountInfo.mint.toBase58(),
                  balance: balance,
                  decimals: mintInfo.decimals,
                  image: mintInfo.uri ? await fetchTokenImage(mintInfo.uri) : undefined
                }
              }
            } catch (error) {
              if (!(error instanceof TokenAccountNotFoundError)) {
                console.error("Error fetching token info:", error)
              }
            }
            return null
          })
        )

        setHoldings(fetchedHoldings.filter((holding): holding is TokenHolding => holding !== null))
      } catch (error) {
        console.error("Error fetching token holdings:", error)
        showToast("Failed to fetch token holdings. Please try again.", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHoldings()
  }, [publicKey, connection])

  const fetchTokenImage = async (uri: string) => {
    try {
      const response = await fetch(uri)
      const metadata = await response.json()
      return metadata.image
    } catch (error) {
      console.error("Error fetching token image:", error)
      return undefined
    }
  }

  return (
    <motion.main 
      className="container mx-auto px-4 py-16 relative z-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        My Token Holdings
      </motion.h1>
      {!publicKey ? (
        <motion.div 
          className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 text-center shadow-lg backdrop-blur-md"
          variants={itemVariants}
        >
          <p className="text-xl text-gray-300 mb-4">Please connect your wallet to view your token holdings.</p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-300 shadow-md hover:shadow-lg">
            Connect Wallet
          </button>
        </motion.div>
      ) : isLoading ? (
        <motion.div 
          className="flex flex-col items-center justify-center"
          variants={itemVariants}
        >
          <FaSpinner className="animate-spin text-5xl text-purple-500 mb-4" />
          <p className="text-xl text-gray-300">Loading your token holdings...</p>
        </motion.div>
      ) : holdings.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {holdings.map((holding, index) => (
            <motion.div key={index} variants={itemVariants}>
              <TokenCard 
                title={holding.name}
                symbol={holding.symbol}
                address={holding.address}
                icon={holding.image || "/default-token-icon.png"}
                href={`/token-details/${holding.address}`}
                onCopy={copyToClipboard}
                additionalInfo={`Balance: ${holding.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${holding.symbol}`}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 text-center shadow-lg backdrop-blur-md"
          variants={itemVariants}
        >
          <p className="text-xl text-gray-300 mb-4">You don&apos;t have any token holdings yet.</p>
          <Link 
            href="/token-list"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Explore Tokens
          </Link>
        </motion.div>
      )}
    </motion.main>
  )
}