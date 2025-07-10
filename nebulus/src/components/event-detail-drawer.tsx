'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription,
  DrawerFooter,
  DrawerClose 
} from './ui/drawer';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import SWhandler from 'smart-widget-handler';
import { useStore } from '@/lib/store';

interface EventDetailDrawerProps {
  event: CuratedEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({ 
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

  React.useEffect(() => {
    if (event?.summary) {
      setEditedSummary(event.summary);
    }
  }, [event?.summary]);

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
      .slice(0, 5); // Limit to 5 tags
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

      // Send event to be published via smart-widget-handler
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
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh] backdrop-blur-xl border border-white/10 shadow-lg">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader className="text-center pb-4">
            <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Event Details
            </DrawerTitle>
            <DrawerDescription className="text-muted-foreground text-sm">
              AI-curated content from Nostr
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-6 overflow-y-auto max-h-[50vh] py-2 overflow-x-hidden">
            {/* Hero Image */}
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative h-48 sm:h-64 rounded-xl overflow-hidden"
              >
                <img 
                  src={imageUrl} 
                  alt="Event image" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </motion.div>
            )}

            {/* AI Summary Section */}
            {event.summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">AI Summary</h3>
                    <p className="text-sm text-muted-foreground">Generated insights</p>
                  </div>
                </div>
                {isEditingSummary ? (
                  <div>
                    <textarea
                      value={editedSummary}
                      onChange={handleSummaryChange}
                      className="w-full p-2 text-sm rounded-md border focus:ring-1 focus:ring-primary focus:outline-none resize-none h-20"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        onClick={handleSaveSummary}
                        className="bg-gradient-to-r from-green-400 to-green-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Summary
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground leading-relaxed text-lg font-medium">
                    {event.summary}
                  </p>
                )}
                {!isEditingSummary && (
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={handleEditSummary}
                      variant="link"
                      className="text-primary font-semibold"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Summary
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Original Content */}
            {event.content && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Original Content</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {event.content}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Event Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Date & Time */}
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Published</span>
                </div>
                <p className="text-foreground">
                  {formatDate(event.created_at)}
                </p>
              </div>

              {/* Author */}
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Author</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {event.pubkey.substring(0, 8)}...{event.pubkey.substring(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyPubkey}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Tags */}
            {eventTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Technical Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card/30 backdrop-blur-xl border border-border/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Technical Details</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Event ID:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">
                      {event.id.substring(0, 12)}...
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyEventId}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Kind:</span>
                  <Badge variant="outline" className="text-xs">
                    {event.kind}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Signature:</span>
                  <span className="font-mono text-xs">
                    {event.sig.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <DrawerFooter className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {event.summary && (
                <Button
                  onClick={handlePostSummaryToNotes}
                  disabled={isPosting || !hostOrigin || !user}
                  className="flex-1 bg-gradient-to-r from-orange-400 to-orange-700 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg rounded-xl cursor-pointer"
                >
                  {posted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Posted!
                    </>
                  ) : isPosting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Summary to Notes
                    </>
                  )}
                </Button>
              )}
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EventDetailDrawer;
