'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Sparkles, 
  User, 
  Copy, 
  ExternalLink, 
  Share2,
  Hash,
  Clock,
  CheckCircle2,
  Send,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { CuratedEvent } from '../types/curate';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import SWhandler from 'smart-widget-handler';
import { useStore } from '@/lib/store';

interface EventDetailModalProps {
  event: CuratedEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ 
  event, 
  isOpen, 
  onOpenChange 
}) => {
  const [isPosting, setIsPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const hostOrigin = useStore((state) => state.origin);
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (event?.summary) {
      setEditedSummary(event.summary);
    }
  }, [event?.summary]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!event) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (tags: string[][]) => {
    const imageTag = tags.find(tag => tag[0] === 'image' && tag[1]);
    return imageTag ? imageTag[1] : null;
  };

  const getEventTags = (tags: string[][]) => {
    return tags
      .filter(tag => tag[0] === 't' && tag[1])
      .map(tag => tag[1])
      .slice(0, 5);
  };

  const handlePostSummaryToNotes = async () => {
    const summaryToPost = editedSummary || event.summary;
    if (!summaryToPost || !hostOrigin) return;

    setIsPosting(true);
    
    try {
      const noteContent = `"${summaryToPost}"\n\nnostr:${event.id}\n\n#AIResearch #NostrEvents`;
      
      const noteEvent = {
        kind: 1,
        content: noteContent,
        tags: [
          ['e', event.id],
          ['p', event.pubkey],
          ['t', 'AIResearch'],
          ['t', 'NostrEvents']
        ]
      };

      SWhandler.client.requestEventPublish(noteEvent, hostOrigin);
      
      setPosted(true);
      setTimeout(() => {
        setPosted(false);
        onOpenChange(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to post summary:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const copyEventId = () => {
    navigator.clipboard.writeText(event.id);
  };

  const copyPubkey = () => {
    navigator.clipboard.writeText(event.pubkey);
  };

  const handleEditSummary = () => {
    setIsEditingSummary(true);
  };

  const handleSaveSummary = () => {
    setIsEditingSummary(false);
  };

  const handleCancelEdit = () => {
    setEditedSummary(event.summary || '');
    setIsEditingSummary(false);
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedSummary(e.target.value);
  };

  const imageUrl = getImageUrl(event.tags);
  const eventTags = getEventTags(event.tags);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-4xl max-h-[90vh] 
                         bg-black/10 backdrop-blur-2xl
                         border border-white/20
                         rounded-3xl shadow-2xl shadow-black/25
                         overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 
                           bg-black/10 hover:bg-black/20 backdrop-blur-sm
                           border border-white/20 rounded-full
                           flex items-center justify-center
                           transition-all duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Header */}
              <div className="relative px-6 py-4 sm:px-8 sm:py-6 
                              bg-gradient-to-br from-white/15 to-white/5
                              border-b border-white/10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Event Details
                  </h1>
                  <p className="text-white/70 text-sm sm:text-base">
                    AI-curated content from Nostr
                  </p>
                </motion.div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto max-h-[calc(80vh-200px)] p-6 sm:p-8 space-y-6">
                
                {/* Hero Image */}
                {imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="relative h-48 sm:h-64 rounded-2xl overflow-hidden
                               border border-white/20 shadow-lg"
                  >
                    <img 
                      src={imageUrl} 
                      alt="Event image" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t 
                                    from-black/50 via-transparent to-transparent" />
                  </motion.div>
                )}

                {/* AI Summary Section */}
                {event.summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative bg-gradient-to-br from-purple-500/20 to-blue-500/20 
                               backdrop-blur-xl border border-purple-300/30 
                               rounded-2xl p-6 sm:p-8 shadow-lg"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 
                                      rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">AI Summary</h3>
                        <p className="text-white/70">Generated insights</p>
                      </div>
                    </div>
                    
                    {isEditingSummary ? (
                      <div>
                        <textarea
                          value={editedSummary}
                          onChange={handleSummaryChange}
                          className="w-full p-4 bg-black/10 backdrop-blur-sm 
                                     border border-white/20 rounded-xl 
                                     text-white placeholder-white/50
                                     focus:ring-2 focus:ring-purple-400 focus:outline-none 
                                     resize-none h-32"
                          placeholder="Edit your summary..."
                        />
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            onClick={handleSaveSummary}
                            className="px-6 py-3 bg-green-500/80 hover:bg-green-500 
                                       backdrop-blur-sm border border-green-400/30 
                                       rounded-xl text-white font-medium
                                       transition-all duration-200 flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-6 py-3 bg-black/10 hover:bg-black/20 
                                       backdrop-blur-sm border border-white/20 
                                       rounded-xl text-white/80 font-medium
                                       transition-all duration-200 flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-white leading-relaxed text-lg mb-6">
                          {event.summary}
                        </p>
                        <div className="flex justify-end">
                          <button
                            onClick={handleEditSummary}
                            className="px-4 py-2 bg-black/10 hover:bg-black/20 
                                       backdrop-blur-sm border border-white/20 
                                       rounded-lg text-white/90 font-medium
                                       transition-all duration-200 flex items-center gap-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Original Content */}
                {event.content && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-black/10 backdrop-blur-xl border border-white/20 
                               rounded-2xl p-6 sm:p-8 shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Hash className="w-6 h-6 text-white/80" />
                      <h3 className="text-xl font-bold text-white">Original Content</h3>
                    </div>
                    <p className="text-white/90 leading-relaxed whitespace-pre-wrap break-words">
                      {event.content}
                    </p>
                  </motion.div>
                )}

                {/* Metadata Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  {/* Date & Time */}
                  <div className="bg-black/10 backdrop-blur-xl border border-white/20 
                                  rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500/30 rounded-lg 
                                      flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-300" />
                      </div>
                      <span className="font-semibold text-white">Published</span>
                    </div>
                    <p className="text-white/90 text-sm">
                      {formatDate(event.created_at)}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="bg-black/10 backdrop-blur-xl border border-white/20 
                                  rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500/30 rounded-lg 
                                      flex items-center justify-center">
                        <User className="w-5 h-5 text-green-300" />
                      </div>
                      <span className="font-semibold text-white">Author</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-white/90 truncate">
                        {event.pubkey.substring(0, 16)}...
                      </span>
                      <button
                        onClick={copyPubkey}
                        className="w-8 h-8 bg-black/10 hover:bg-black/20 
                                   rounded-lg flex items-center justify-center
                                   transition-all duration-200"
                      >
                        <Copy className="w-4 h-4 text-white/80" />
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Tags */}
                {eventTags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-white/80" />
                      <span className="font-semibold text-white">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {eventTags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-black/15 backdrop-blur-sm 
                                     border border-white/20 rounded-lg 
                                     text-white/90 text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Technical Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-black/5 backdrop-blur-xl border border-white/10 
                             rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Hash className="w-5 h-5 text-white/80" />
                    <span className="font-semibold text-white">Technical Details</span>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Event ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white/90 text-xs">
                          {event.id.substring(0, 16)}...
                        </span>
                        <button
                          onClick={copyEventId}
                          className="w-6 h-6 bg-black/10 hover:bg-black/20 
                                     rounded flex items-center justify-center
                                     transition-all duration-200"
                        >
                          <Copy className="w-3 h-3 text-white/80" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Kind:</span>
                      <span className="px-2 py-1 bg-black/10 rounded text-white/90 text-xs">
                        {event.kind}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Signature:</span>
                      <span className="font-mono text-white/90 text-xs">
                        {event.sig.substring(0, 12)}...
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="p-6 sm:p-8 bg-gradient-to-t from-white/10 to-white/5 
                              border-t border-white/10">
                {event.summary && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={handlePostSummaryToNotes}
                    disabled={isPosting || !hostOrigin || !user}
                    className="w-full py-4 bg-gradient-to-r from-orange-500/80 to-red-500/80 
                               hover:from-orange-500 hover:to-red-500 
                               backdrop-blur-sm border border-orange-400/30 
                               rounded-2xl text-white font-semibold text-lg
                               transition-all duration-300 flex items-center justify-center gap-3
                               disabled:opacity-50 disabled:cursor-not-allowed
                               shadow-lg"
                  >
                    {posted ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Posted Successfully!
                      </>
                    ) : isPosting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Post Summary to Notes
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventDetailModal;
