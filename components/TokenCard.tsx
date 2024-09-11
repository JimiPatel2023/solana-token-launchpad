import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ReactNode, useState } from 'react'
import { FaCopy, FaExternalLinkAlt } from 'react-icons/fa'

interface TokenCardProps {
  title: string
  symbol: string
  address: string
  icon: string | ReactNode
  href: string
  onCopy: (text: string) => void
  additionalInfo?: string
}

export default function TokenCard({ title, symbol, address, icon, href, onCopy, additionalInfo }: TokenCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    onCopy(address)
  }

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-900/30 to-pink-600/30 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.3)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 mr-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-3xl overflow-hidden">
          {typeof icon === 'string' ? (
            imageError ? (
              <span>🪙</span>
            ) : (
              <Image 
                src={icon} 
                alt={title} 
                width={64} 
                height={64} 
                className="object-cover"
                onError={handleImageError}
              />
            )
          ) : (
            icon
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-gray-300 text-sm">{symbol}</p>
        </div>
      </div>
      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg flex items-center justify-between">
        <span className="text-gray-300 text-sm font-mono">{shortenAddress(address)}</span>
        <button 
          onClick={handleCopy}
          className="ml-2 p-2 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors duration-300 flex items-center justify-center"
          aria-label="Copy token address"
        >
          <FaCopy className="text-white w-4 h-4" />
        </button>
      </div>
      {additionalInfo && (
        <p className="text-gray-300 text-sm mt-2 mb-4">{additionalInfo}</p>
      )}
      <Link 
        href={href}
        className="w-full inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
      >
        View Details
        <FaExternalLinkAlt className="ml-2 w-4 h-4" />
      </Link>
    </motion.div>
  )
}