'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import {
    Home, 
    Zap, 
    Star, 
    Settings, 
    User as UserIcon, 
    BookOpen, 
    TrendingUp, 
    Heart,
    MessageSquare,
    CloudLightning
} from 'lucide-react'
import { User } from '@/lib/store'

interface SidebarProps {
    className?: string;
    user?: User | null;
}

const Sidebar = ({ className = '', user }: SidebarProps) => {
    const router = useRouter()
    
    const getInitials = (fullName: string) => {
        return fullName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }
    
    const navigationItems = [
        { icon: Home, label: 'Home', path: '/', active: true },
        { icon: Zap, label: 'Create', path: '/create' },
        { icon: Star, label: 'Explore', path: '/explore' },
        { icon: TrendingUp, label: 'Trending', path: '/trending' },
        { icon: BookOpen, label: 'Library', path: '/library' },
        { icon: Heart, label: 'Favorites', path: '/favorites' },
        { icon: MessageSquare, label: 'Chat', path: '/chat' },
    ]
    
    const bottomItems = [
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: UserIcon, label: 'Profile', path: '/profile' },
    ]
    
    return (
        <motion.aside 
            className={`hidden lg:flex fixed left-3 top-20 bottom-3 w-64 z-40 backdrop-blur-xl bg-white/5 border border-white/20 rounded-xl shadow-2xl flex-col ${className}`}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
                <motion.div 
                    className="absolute inset-0 opacity-20"
                    animate={{ 
                        background: [
                            'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
                            'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                            'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
                            'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
                            'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
                        ]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
            </div>
            
            <div className="relative flex flex-col h-full p-4">
                {/* Logo section */}
                <motion.div 
                    className="flex items-center gap-3 mb-8 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => router.push('/')}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <CloudLightning className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                            Nebula
                        </h1>
                        <p className="text-white/60 text-xs">Nebulus Smart AI</p>
                    </div>
                </motion.div>

                {/* User profile section */}
                {user && (
                    <motion.div 
                        className="mb-6 p-3 rounded-lg bg-white/5 border border-white/10"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    >
                        <div className="flex items-center gap-3">
                            {user.picture ? (
                                <motion.img
                                    src={user.picture}
                                    alt={user.display_name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 flex items-center justify-center text-white font-semibold text-sm">
                                    {getInitials(user.display_name)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{user.display_name}</p>
                                <p className="text-white/60 text-xs truncate">@{user.name}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
                
                {/* Main navigation */}
                <nav className="flex-1 space-y-2">
                    {navigationItems.map((item, index) => (
                        <motion.button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                item.active 
                                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-white' 
                                    : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                            }`}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </motion.button>
                    ))}
                </nav>
                
                {/* Stats section - only show if user is logged in */}
                {user && (
                    <motion.div 
                        className="my-6 p-4 rounded-lg bg-white/5 border border-white/10"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <h3 className="text-white/80 font-medium text-sm mb-3">Your Stats</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-white/60 text-xs">Apps Created</span>
                                <span className="text-white text-xs font-medium">12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60 text-xs">Total Views</span>
                                <span className="text-white text-xs font-medium">2.4k</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60 text-xs">Favorites</span>
                                <span className="text-white text-xs font-medium">89</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                
                {/* Bottom navigation */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                    {bottomItems.map((item, index) => (
                        <motion.button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: (navigationItems.length + index) * 0.1 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.aside>
    )
}

export default Sidebar