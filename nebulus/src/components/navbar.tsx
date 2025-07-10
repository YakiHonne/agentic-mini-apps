'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, CloudLightning } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/store'

interface NavbarProps {
  user?: User | null;
}

const Navbar = ({ user }: NavbarProps) => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  
  return (
    <motion.nav 
      className="fixed top-4 left-4 right-4 z-50 backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl shadow-2xl"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{ 
            background: [
              'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
              'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
              'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
              'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
              'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="relative px-6 py-4">
        <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => router.push('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <CloudLightning className="w-6 h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="font-bold text-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Nebula
                </h1>
                <p className="text-white/60 text-xs">Nebulus AI lightning</p>
              </div>
            </motion.div>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <motion.div 
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  {
                    user?.picture ? (
                        <motion.img
                          src={user.picture}
                          alt={user.display_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 flex items-center justify-center text-white font-semibold">
                          {getInitials(user.display_name)}
                        </div>
                    )
                  }
                  <button className="flex flex-col text-left cursor-pointer"
                  >
                    <p className="text-white text-sm font-medium">{user?.display_name}</p>
                    <p className="text-white/60 text-xs line-clamp-1">{user?.about}</p>
                    <p className="text-white/60 text-xs line-clamp-1">@{user?.name}</p>
                  </button>
                </motion.div>
                
              </div>
            ) : null}
          </div>
          
          <motion.button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden mt-4 pt-4 border-t border-white/10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {user ? (
              <div className="flex items-center gap-4">
                <motion.div 
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  {
                    user?.picture ? (
                        <motion.img
                          src={user.picture}
                          alt={user.display_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 flex items-center justify-center text-white font-semibold">
                          {getInitials(user.display_name)}
                        </div>
                    )
                  }
                  <button className="flex flex-col text-left cursor-pointer"
                  >
                    <p className="text-white text-sm font-medium">{user?.display_name}</p>
                    <p className="text-white/60 text-xs line-clamp-1">{user?.about}</p>
                    <p className="text-white/60 text-xs line-clamp-1">@{user?.name}</p>
                  </button>
                </motion.div>
                
              </div>
            ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar