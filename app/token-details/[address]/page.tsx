"use client"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useConnection } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import { PublicKey } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, getMint, getTokenMetadata } from "@solana/spl-token"
import { showToast } from '@/components/CustomToast'
import Image from 'next/image'
import { FaSpinner } from 'react-icons/fa'

interface TokenDetails {
  name: string
  symbol: string
  address: string
  image?: string
  totalSupply: number
  decimals: number
  uri?: string
  mintAuthority?: string
  freezeAuthority?: string
  supply: number
  isInitialized: boolean
  fixedSupply: boolean
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

export default function TokenDetails() {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const { address } = useParams()
  const { connection } = useConnection()

  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!address) return

      setIsLoading(true)
      try {
        const mintPubkey = new PublicKey(address as string)
        const mintInfo = await getMint(connection, mintPubkey, undefined, TOKEN_2022_PROGRAM_ID)
        const metadata = await getTokenMetadata(connection, mintPubkey)

        const tokenData: TokenDetails = {
          name: 'Unknown Token',
          symbol: 'UNKNOWN',
          address: address as string,
          totalSupply: Number(mintInfo.supply),
          decimals: mintInfo.decimals,
          mintAuthority: mintInfo.mintAuthority?.toBase58(),
          freezeAuthority: mintInfo.freezeAuthority?.toBase58(),
          supply: Number(mintInfo.supply),
          isInitialized: mintInfo.isInitialized,
          fixedSupply: mintInfo.supply > 0 && !mintInfo.mintAuthority,
        }

        if (metadata) {
          tokenData.name = metadata.name
          tokenData.symbol = metadata.symbol
          tokenData.uri = metadata.uri
          if (metadata.uri) {
            try {
              const metadataJson = await fetch(metadata.uri).then(res => res.json())
              tokenData.image = metadataJson.image
            } catch (error) {
              console.error("Error fetching metadata JSON:", error)
            }
          }
        }

        setTokenDetails(tokenData)
      } catch (error) {
        console.error("Error fetching token details:", error)
        showToast("Failed to fetch token details. Please try again.", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokenDetails()
  }, [address, connection])

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <motion.main 
      className="container mx-auto px-4 py-8 md:py-16 relative z-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-3xl md:text-5xl font-bold text-center mb-8 md:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
        variants={itemVariants}
      >
        Token Details
      </motion.h1>
      {isLoading ? (
        <motion.div 
          className="flex flex-col items-center justify-center"
          variants={itemVariants}
        >
          <FaSpinner className="animate-spin text-5xl text-purple-500 mb-4" />
          <p className="text-xl text-gray-300">Loading token details...</p>
        </motion.div>
      ) : tokenDetails ? (
        <motion.div 
          className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-4 md:p-8 shadow-lg"
          variants={containerVariants}
        >
          <motion.div className="flex flex-col md:flex-row items-center mb-6 md:mb-8" variants={itemVariants}>
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-300 flex items-center justify-center mb-4 md:mb-0 md:mr-8 overflow-hidden">
              {tokenDetails.image && !imageError ? (
                <Image 
                  src={tokenDetails.image} 
                  alt={tokenDetails.name} 
                  width={128} 
                  height={128} 
                  className="object-cover w-full h-full"
                  onError={handleImageError}
                />
              ) : (
                <span className="text-4xl md:text-6xl">🪙</span>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{tokenDetails.name}</h2>
              <p className="text-lg md:text-xl text-gray-300">{tokenDetails.symbol}</p>
            </div>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-1">Address</h3>
              <p className="text-gray-300 break-all text-sm md:text-base">{tokenDetails.address}</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-1">Total Supply</h3>
              <p className="text-gray-300 text-sm md:text-base">
                {(tokenDetails.totalSupply / Math.pow(10, tokenDetails.decimals)).toLocaleString()} {tokenDetails.symbol}
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-1">Decimals</h3>
              <p className="text-gray-300 text-sm md:text-base">{tokenDetails.decimals}</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-1">Mint Authority</h3>
              <p className="text-gray-300 break-all text-sm md:text-base">{tokenDetails.mintAuthority || 'None (Fixed Supply)'}</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-1">Freeze Authority</h3>
              <p className="text-gray-300 break-all text-sm md:text-base">{tokenDetails.freezeAuthority || 'None'}</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-1">Current Supply</h3>
              <p className="text-gray-300 text-sm md:text-base">
                {(tokenDetails.supply / Math.pow(10, tokenDetails.decimals)).toLocaleString()} {tokenDetails.symbol}
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-1">Initialized</h3>
              <p className="text-gray-300 text-sm md:text-base">{tokenDetails.isInitialized ? 'Yes' : 'No'}</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-1">Supply Type</h3>
              <p className="text-gray-300 text-sm md:text-base">{tokenDetails.fixedSupply ? 'Fixed' : 'Variable'}</p>
            </motion.div>
            {tokenDetails.uri && (
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold mb-1">Metadata URI</h3>
                <a href={tokenDetails.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all text-sm md:text-base">
                  {tokenDetails.uri}
                </a>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      ) : (
        <p className="text-center text-xl mt-8">Token details not found.</p>
      )}
    </motion.main>
  )
}