import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import { CuratedEvent } from '../types/curate';
import EventDetailDrawer from './event-detail-drawer';

interface EventsProps {
    curatedEvents: CuratedEvent[];
}

const Events: React.FC<EventsProps> = ({ curatedEvents }) => {
    const [selectedEvent, setSelectedEvent] = useState<CuratedEvent | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
                className="flex items-center justify-center py-12"
            >
                <div className="text-center">
                    <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <div className="text-white/60 text-sm">
                        No events found yet. Search for Topics to See what is happening <span className='bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold'>Right Now</span> in Crypto.
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
        >
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {curatedEvents.map((event, index) => {
                    const imageUrl = getImageUrl(event.tags);
                    
                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden hover:bg-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer hover:shadow-lg"
                            onClick={() => handleEventClick(event)}
                        >
                            {imageUrl && (
                                <div className="relative h-32 sm:h-48 overflow-hidden">
                                    <img 
                                        src={imageUrl} 
                                        alt="" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                            )}
                            
                            <div className="p-4">
                                {event.summary && (
                                    <div className="mb-3">
                                        <div className="flex items-start gap-2 mb-2">
                                            <Sparkles className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                            <div className="text-purple-200/90 text-xs font-medium">AI Summary</div>
                                        </div>
                                        <p className="text-white/85 text-sm leading-relaxed font-normal">
                                            {event.summary}
                                        </p>
                                    </div>
                                )}
                                
                                {event.content && (
                                    <p className="text-white/60 text-xs leading-relaxed mb-3 line-clamp-2">
                                        {event.content}
                                    </p>
                                )}
                                
                                <div className="flex items-center justify-between text-xs text-white/40">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <time dateTime={new Date(event.created_at * 1000).toISOString()}>
                                            {formatDate(event.created_at)}
                                        </time>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-mono">
                                            {event.pubkey.substring(0, 6)}...
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-white/60">
                                            Click to view
                                        </div>
                                    </div>
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
