"use client"
import HomeTokenCard from "@/components/HomeTokenCard"
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    }
  }
}

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
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
      className="container mx-auto px-4 py-10 relative z-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-6xl font-bold text-center mb-20 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Solana Token Launchpad
      </motion.h1>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants}>
          <HomeTokenCard 
            title="Create Token" 
            description="Launch your own Solana token with ease. Customize and deploy in minutes." 
            buttonText="Get Started"
            icon="🚀"
            href="/create-token"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <HomeTokenCard 
            title="My Tokens" 
            description="Manage and monitor your launched tokens. Track performance and make updates." 
            buttonText="View My Tokens"
            icon="💼"
            href="/view-tokens"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <HomeTokenCard 
            title="Token List" 
            description="Explore a diverse range of Solana tokens. Discover new projects and opportunities." 
            buttonText="View Tokens"
            icon="📊"
            href="/my-tokens"
          />
        </motion.div>
      </motion.div>
    </motion.main>
  )
}
