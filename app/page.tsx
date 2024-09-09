"use client"
import TokenCard from '@/components/TokenCard'
import { motion } from 'framer-motion'

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

const cardVariants = {
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

export default function Home() {
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
        Solana Token Launchpad
      </motion.h1>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants}>
          <TokenCard 
            title="Create Token" 
            description="Launch your own Solana token" 
            buttonText="Get Started"
            icon="🚀"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <TokenCard 
            title="Token List" 
            description="Explore launched tokens" 
            buttonText="View Tokens"
            icon="📊"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <TokenCard 
            title="My Tokens" 
            description="Manage your launched tokens" 
            buttonText="View My Tokens"
            icon="💼"
          />
        </motion.div>
      </motion.div>
    </motion.main>
  )
}
