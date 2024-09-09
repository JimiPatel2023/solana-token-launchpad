"use client"
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TokenCardProps {
  title: string
  description: string
  buttonText: string
  icon: string
}

export default function TokenCard({ title, description, buttonText, icon }: TokenCardProps) {
  return (
    <motion.div
      className="bg-[#1E293B]/50 backdrop-blur-xl rounded-xl overflow-hidden border border-[#3730A3]/20 shadow-xl"
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)",
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      <div className="p-6">
        <motion.div 
          className="text-4xl mb-4"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.2, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        <Link href={title === "Create Token" ? "/create-token" : "#"}>
          <motion.button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 ease-out"
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(147, 51, 234, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            {buttonText}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}