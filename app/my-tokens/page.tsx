"use client"
import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import TokenCard from '@/components/TokenCard'
import { PublicKey } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, getMint, getTokenMetadata, getAccount, TokenAccountNotFoundError } from "@solana/spl-token"
import { showToast } from '@/components/CustomToast'
import { FaSpinner } from 'react-icons/fa'
import Link from "next/link"

interface Token {
  name: string
  symbol: string
  address: string
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

export default function MyTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
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
    const fetchTokens = async () => {
      if (!publicKey) return

      setIsLoading(true)
      try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, { programId: TOKEN_2022_PROGRAM_ID })

        const fetchedTokens = await Promise.all(
          tokenAccounts.value.map(async ({ pubkey, account }) => {
            try {
              const accountInfo = await getAccount(connection, pubkey, undefined, TOKEN_2022_PROGRAM_ID)
              const mintInfo = await getMint(connection, accountInfo.mint, undefined, TOKEN_2022_PROGRAM_ID)
              
              if (mintInfo.mintAuthority?.equals(publicKey)) {
                const metadata = await getTokenMetadata(connection, accountInfo.mint)
                if (metadata) {
                  let image = undefined
                  if (metadata.uri) {
                    try {
                      const metadataJson = await fetch(metadata.uri).then(res => res.json())
                      image = metadataJson.image
                    } catch (error) {
                      console.error("Error fetching metadata JSON:", error)
                    }
                  }
                  return {
                    name: metadata.name,
                    symbol: metadata.symbol,
                    address: accountInfo.mint.toBase58(),
                    image: image
                  }
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

        setTokens(fetchedTokens.filter((token): token is Token => token !== null))
      } catch (error) {
        console.error("Error fetching tokens:", error)
        showToast("Failed to fetch tokens. Please try again.", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [publicKey, connection])

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
        My Created Tokens
      </motion.h1>
      {!publicKey ? (
        <motion.div 
          className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 text-center shadow-lg backdrop-blur-md"
          variants={itemVariants}
        >
          <p className="text-xl text-gray-300 mb-4">Please connect your wallet to view your created tokens.</p>
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
          <p className="text-xl text-gray-300">Loading your created tokens...</p>
        </motion.div>
      ) : tokens.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {tokens.map((token, index) => (
            <motion.div key={index} variants={itemVariants}>
              <TokenCard 
                title={token.name}
                symbol={token.symbol}
                address={token.address}
                icon={token.image || "/default-token-icon.png"}
                href={`/token-details/${token.address}`}
                onCopy={copyToClipboard}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 text-center shadow-lg backdrop-blur-md"
          variants={itemVariants}
        >
          <p className="text-xl text-gray-300 mb-4">You haven&apos;t created any tokens yet.</p>
          <Link 
            href="/create-token"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Create Your First Token
          </Link>
        </motion.div>
      )}
    </motion.main>
  )
}