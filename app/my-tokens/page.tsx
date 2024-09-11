"use client"
import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import TokenCard from '@/components/TokenCard'
import { PublicKey } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, getAccount, TokenAccountNotFoundError, getMint, getTokenMetadata } from "@solana/spl-token"
import { showToast } from '@/components/CustomToast'
import { FaSpinner } from 'react-icons/fa'
import Link from "next/link"

interface TokenHolding {
  address: string
  balance: number
  decimals: number
  name: string
  symbol: string
  icon: string
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
        const response = await fetch("https://backpack-api.xnfts.dev/v2/graphql", {
          method: "POST",
          headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,gu;q=0.8,en-GB;q=0.7,ja;q=0.6",
            "apollographql-client-name": "backpack-extension",
            "apollographql-client-version": "0.10.85",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "none",
            "x-backpack-cache-key-prefix": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
            "x-backpack-ignore-response-cache": "false",
            "x-blockchain-caip2": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
            "x-blockchain-custom-rpc": "true",
            "x-blockchain-rpc": "https://api.devnet.solana.com",
            "cookie": "__cf_bm=HoJcVH67CIrMekCr2MvMRhh0jW8BBlSOFtpFJKwrN58-1726043148-1.0.1.1-VArrpIsxdumcWOfr9zoQbk9g3Fr8OZx_iRuDwGGe_6xHqQaYpWWV9Es3UkjV7pkImtWWB3uktfextZaxdyXeOA"
          },
          body: JSON.stringify({
            operationName: "GetTokenBalances",
            variables: {
              address: publicKey.toString(),
              caip2: {
                namespace: "solana",
                reference: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
              },
              providerId: "SOLANA"
            },
            query: `
              query GetTokenBalances($address: String!, $caip2: Caip2!, $providerId: ProviderID!) {
                wallet(address: $address, caip2: $caip2, providerId: $providerId) {
                  balances {
                    tokens {
                      edges {
                        node {
                          address
                          amount
                          decimals
                          displayAmount
                          token
                          tokenListEntry {
                            address
                            decimals
                            logo
                            name
                            symbol
                          }
                        }
                      }
                    }
                  }
                }
              }
            `
          })
        });

        const data = await response.json();
        const tokenEdges = data.data.wallet.balances.tokens.edges;

        const fetchedHoldings = tokenEdges.map(({ node }:any) => ({
          address: node.token,
          balance: parseFloat(node.displayAmount),
          decimals: node.decimals,
          name: node.tokenListEntry?.name || "Unknown Token",
          symbol: node.tokenListEntry?.symbol || "???",
          icon: node.tokenListEntry?.logo || "/default-token-icon.png"
        }));

        setHoldings(fetchedHoldings);
      } catch (error) {
        console.error("Error fetching token holdings:", error)
        showToast("Failed to fetch token holdings. Please try again.", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHoldings()
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
                icon={holding.icon}
                href={`/token-details/${holding.address}`}
                onCopy={copyToClipboard}
                additionalInfo={`Balance: ${holding.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}`}
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