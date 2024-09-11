import { motion } from 'framer-motion'
import Link from 'next/link'
import { ReactNode } from 'react'

interface HomeTokenCardProps {
  title: string
  description: string
  buttonText: string
  icon: string | ReactNode
  href: string
}

export default function HomeTokenCard({ title, description, buttonText, icon, href }: HomeTokenCardProps) {
  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-900/30 to-pink-600/30 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.03, boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.3)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-4xl text-white">
          {typeof icon === 'string' ? icon : icon}
        </div>
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-gray-300 mb-8">{description}</p>
        <Link 
          href={href}
          className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
        >
          {buttonText}
        </Link>
      </div>
    </motion.div>
  )
}