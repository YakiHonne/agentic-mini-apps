import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, MessageCircle, Zap, Share, Heart, ExternalLink } from 'lucide-react';
import { CuratedEvent } from '../types/curate';
import EventDetailDrawer from './event-detail-drawer';
import { useStore } from '@/lib/store';

interface EventsProps {
    curatedEvents: CuratedEvent[];
}

const Events: React.FC<EventsProps> = ({ curatedEvents }) => {
    const [selectedEvent, setSelectedEvent] = useState<CuratedEvent | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const user = useStore(state => state.user)

    const handleEventClick = (event: CuratedEvent) => {
        setSelectedEvent(event);
        setIsDrawerOpen(true);
    };
    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getImageUrl = (tags: string[][]) => {
        const imageTag = tags.find(tag => tag[0] === 'image' && tag[1]);
        return imageTag ? imageTag[1] : null;
    };

    if (curatedEvents.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center py-16"
            >
                <div 
                    className="text-center p-8 rounded-2xl relative overflow-hidden bg-transparent backdrop-blur-sm"
                >
                    {/* Animated background gradient */}
                    <motion.div
                        className="absolute inset-0 opacity-30 rounded-2xl"
                        animate={{
                            background: [
                                'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
                                'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
                                'radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
                                'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
                            ]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    
                    <motion.div
                        animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative"
                    >
                        <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    </motion.div>
                    
                    <div className="relative z-10">
                        <h3 className="text-white text-lg font-semibold mb-2">Ready to Explore?</h3>
                        <div className="text-white/60 text-sm max-w-sm mx-auto">
                            { user?.name && <>Hey <span className='bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent font-bold'>@{user?.name}</span>!{" "}</>}
                            No events found yet. Search for Topics to See what is happening <span className='bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent font-bold'>Right Now</span> in the decentralized world.
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="grid gap-6 grid-cols-1 ">
                {curatedEvents.map((event, index) => {
                    const imageUrl = getImageUrl(event.tags);
                    
                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                                delay: index * 0.1, 
                                duration: 0.6,
                                type: "spring",
                                stiffness: 100,
                                damping: 15
                            }}
                            whileHover={{ 
                                y: -8, 
                                scale: 1.03,
                                rotateX: 5,
                                rotateY: 5,
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative overflow-hidden rounded-2xl cursor-pointer transform-gpu border border-white/20 backdrop:blur-sm"
                            onClick={() => handleEventClick(event)}
                        >
                            {/* Animated gradient background */}
                            <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                                animate={{
                                    background: [
                                        'radial-gradient(circle at 0% 0%, rgba(120, 119, 198, 0.4) 0%, transparent 50%)',
                                        'radial-gradient(circle at 100% 100%, rgba(255, 119, 198, 0.4) 0%, transparent 50%)',
                                        'radial-gradient(circle at 0% 100%, rgba(120, 219, 255, 0.4) 0%, transparent 50%)',
                                        'radial-gradient(circle at 0% 0%, rgba(120, 119, 198, 0.4) 0%, transparent 50%)',
                                    ]
                                }}
                                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Shimmer effect */}
                            <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                                initial={false}
                                animate={{
                                    background: [
                                        'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                                        'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                                    ],
                                    x: ['-100%', '100%']
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />

                            {imageUrl && (
                                <div className="relative h-36 sm:h-72 overflow-hidden">
                                    <motion.img 
                                        src={imageUrl} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                    />
                                    <div 
                                        className="absolute inset-0"
                                        style={{
                                            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.8) 100%)'
                                        }}
                                    />
                                    
                                    {/* Floating action buttons */}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 transition-all"
                                        >
                                            <Heart className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 transition-all"
                                        >
                                            <Share className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="relative p-2.5 sm:p-5 space-y-4 flex flex-col justify-between">
                                <div className="">
                                    {event.summary && (
                                        <motion.div 
                                            className="space-y-3"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <motion.div
                                                    animate={{ 
                                                        rotate: [0, 360],
                                                        scale: [1, 1.2, 1]
                                                    }}
                                                    transition={{ 
                                                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                                    }}
                                                >
                                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                                </motion.div>
                                                <span className="text-purple-300 text-xs font-semibold tracking-wide uppercase">
                                                    AI Insight
                                                </span>
                                            </div>
                                            <p className="text-white text-sm leading-relaxed font-medium">
                                                {event.summary}
                                            </p>
                                        </motion.div>
                                    )}
                                    
                                    {event.content && (
                                        <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
                                            {event.content}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Footer */}
                                <div className="flex flex-col gap-3 pt-3 border-t border-white/10 mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-xs text-white/60">
                                            <Calendar className="w-3 h-3" />
                                            <time dateTime={new Date(event.created_at * 1000).toISOString()}>
                                                {formatDate(event.created_at)}
                                            </time>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-white/40">
                                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                            <span className="font-mono">
                                                {event.pubkey.substring(0, 6)}...
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                                        >
                                            <MessageCircle className="w-3 h-3 text-white/60" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                                        >
                                            <Zap className="w-3 h-3 text-orange-400" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                                        >
                                            <ExternalLink className="w-3 h-3 text-white/60" />
                                        </motion.button>
                                    </div>

                                    {/* Hover indicator */}
                                    <motion.div 
                                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-center"
                                        initial={{ y: 10 }}
                                        whileHover={{ y: 0 }}
                                    >
                                        <span className="text-xs text-purple-300 font-medium">
                                            Click to explore ✨
                                        </span>
                                    </motion.div>
                                </div>

                            </div>
                        </motion.div>
                    );
                })}
            </div>
            
            {/* Event Detail Drawer */}
            <EventDetailDrawer 
                event={selectedEvent}
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
            />
        </motion.div>
    );
};

export default Events;
