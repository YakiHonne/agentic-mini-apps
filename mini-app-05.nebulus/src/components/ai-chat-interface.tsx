'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Brain, 
  MessageSquare, 
  Mic, 
  Image, 
  Paperclip,
  MoreVertical,
  Copy,
  Star,
  Trash2,
  Bot,
  User,
  X,
  Maximize,
  Minimize,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import SolanaPaymentModal from './solana-payment-modal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  tokens?: number;
  cost?: number;
  actions?: Array<{
    type: 'search' | 'analysis' | 'recommendation' | 'data_fetch';
    payload: any;
    description: string;
  }>;
  followUpQuestions?: string[];
  confidence?: number;
  isPremium?: boolean;
}

interface AIChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string, type: 'search' | 'deep-analysis') => void;
}

export default function AIChatInterface({ isOpen, onClose, onSearch }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "🚀 **Welcome to Nebulus AI Chat!** I'm your advanced AI assistant specializing in Nostr protocol, cryptocurrency, and decentralized technologies.\n\n💡 **What I can help you with:**\n• Nostr protocol insights and technical questions\n• Cryptocurrency market analysis and trends\n• Real-time community sentiment analysis\n• Technical explanations of blockchain protocols\n• Privacy and security best practices\n• DeFi and Web3 ecosystem guidance\n\n**Free tier:** 10 messages per day  \n**Premium:** Unlimited chat + advanced analysis (0.001 SOL)\n\nHow can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(10);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { connected, publicKey } = useWallet();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (paymentSignature?: string) => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      const userContext = {
        walletConnected: connected,
        publicKey: publicKey?.toString(),
        recentSearches: [], // You can implement this based on user's search history
        preferences: {}
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          conversationHistory,
          userContext,
          paymentSignature
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPayment || data.limitReached) {
          if (data.limitReached && !connected) {
            toast.error('Daily free message limit reached. Connect wallet for premium unlimited chat!');
          } else if (data.requiresPayment) {
            setShowPaymentModal(true);
          } else {
            toast.error(data.error);
          }
          return;
        }
        throw new Error(data.error || 'Failed to get response');
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.content,
        timestamp: new Date(),
        actions: data.actions,
        followUpQuestions: data.followUpQuestions,
        confidence: data.confidence,
        isPremium: data.isPremium,
        tokens: data.isPremium ? Math.floor(data.content.length / 4) : undefined,
        cost: data.isPremium ? 0.001 : undefined
      };

      setMessages(prev => [...prev, aiResponse]);
      setRemainingMessages(data.remainingMessages || 0);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: "I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to explore the Nostr search functionality! 🛠️",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (signature: string) => {
    setShowPaymentModal(false);
    toast.success('Payment confirmed! Premium chat activated.');
    handleSendMessage(signature);
  };

  const handleActionClick = (action: any) => {
    if (action.type === 'search' && onSearch) {
      onSearch(action.payload.query, action.payload.type || 'search');
      toast.success(`Searching for: ${action.payload.query}`);
    }
  };

  const handleFollowUpClick = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        toast.info('Listening... Speak now!');
      };
      
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        toast.success('Voice input captured!');
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };
      
      recognition.start();
    } else {
      toast.error('Voice input not supported in this browser.');
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`w-full h-full ${isMaximized ? 'max-w-none' : 'max-w-4xl h-[85vh] sm:h-[80vh]'} rounded-2xl overflow-hidden relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Header */}
          <div className="relative border-b border-white/10 p-4 sm:p-6 bg-slate-900/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-white">Nebulus AI Chat</h3>
                  <p className="text-[10px] sm:text-sm text-gray-400">
                    {connected ? `Premium Available • ${remainingMessages} messages left` : `Free: ${remainingMessages}/10 messages today`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connected && (
                  <div className="hidden sm:block px-3 py-1 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-lg">
                    <span className="text-xs text-green-300">Wallet Connected</span>
                  </div>
                )}
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  title={isMaximized ? "Minimize" : "Maximize"}
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-2.5 sm:p-6 space-y-4 sm:space-y-6 min-h-0"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 sm:gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <motion.div
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl relative group ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                        : `${message.isPremium ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-400/30' : 'bg-white/5 border border-white/10'} text-white`
                    }`}
                    style={{
                      backdropFilter: 'blur(10px)',
                      boxShadow: message.type === 'user' 
                        ? '0 8px 32px rgba(59, 130, 246, 0.3)' 
                        : message.isPremium
                        ? '0 8px 32px rgba(147, 51, 234, 0.2)'
                        : '0 8px 32px rgba(0, 0, 0, 0.2)'
                    }}
                    whileHover={{ scale: 1.01 }}
                  >
                    {message.isPremium && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      </div>
                    )}
                    
                    {/* Render markdown for AI messages, plain text for user messages */}
                    {message.type === 'ai' ? (
                      <div className="prose prose-sm sm:prose prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight, rehypeRaw]}
                          components={{
                            code: ({ node, inline, className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <div className="relative">
                                  <pre className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto text-sm border border-white/10">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                  <button
                                    onClick={() => copyMessage(String(children))}
                                    className="absolute top-2 right-2 p-1 rounded bg-white/10 hover:bg-white/20 transition-all"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            p: ({ children }) => <p className="mb-2 last:mb-0 text-sm sm:text-base leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 ml-4">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 ml-4">{children}</ol>,
                            li: ({ children }) => <li className="text-sm sm:text-base">{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg sm:text-xl font-bold mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base sm:text-lg font-semibold mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm sm:text-base font-medium mb-1">{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-500/10 rounded-r-lg italic">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    {/* AI Actions */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-2">Suggested actions:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.actions.map((action, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleActionClick(action)}
                              className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-lg text-xs hover:bg-blue-500/30 transition-all"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {action.description}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Questions */}
                    {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-2">Follow-up questions:</p>
                        <div className="space-y-1">
                          {message.followUpQuestions.map((question, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleFollowUpClick(question)}
                              className="block w-full text-left px-3 py-2 bg-white/5 border border-white/10 text-white/80 rounded-lg text-xs hover:bg-white/10 hover:text-white transition-all"
                              whileHover={{ x: 5 }}
                            >
                              💭 {question}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(message.tokens || message.confidence) && (
                      <div className="mt-3 pt-2 border-t border-white/10 text-xs text-gray-400 flex justify-between">
                        <div>
                          {message.tokens && <span>Tokens: {message.tokens}</span>}
                          {message.cost && <span className="ml-3">Cost: {message.cost} SOL</span>}
                        </div>
                        {message.confidence && (
                          <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => copyMessage(message.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/20 hover:bg-black/30 transition-all"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </motion.div>
                  
                  <div className={`mt-1 sm:mt-2 text-xs text-gray-500 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    <span className="text-sm text-gray-300">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
            <div className="relative border-t border-white/10 p-4 sm:p-6 bg-slate-900/50 flex-shrink-0">
            {/* Glassmorphic Container */}
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
              <motion.div 
                className="absolute inset-0 opacity-20"
                animate={{ 
                background: [
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                  'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                ]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              </div>

              {/* Input Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
              <div className="relative p-4 sm:p-6">
                <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Nostr, crypto, DeFi, or get AI analysis..."
                className="w-full bg-transparent text-white placeholder-white/40 border-none outline-none resize-none min-h-[40px] sm:min-h-[60px] max-h-[120px] text-sm sm:text-lg leading-relaxed pr-32 sm:pr-36"
                rows={1}
                disabled={isLoading}
                />
                
                {/* Voice Input Button */}
                <motion.button
                type="button"
                onClick={handleVoiceInput}
                disabled={isListening || isLoading}
                className={`absolute bottom-4 sm:bottom-6 right-20 sm:right-24 p-2 rounded-lg transition-all ${
                  isListening 
                  ? 'bg-red-500/30 text-red-400 animate-pulse' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isListening ? "Listening..." : "Voice input"}
                >
                <Mic className="w-4 h-4" />
                </motion.button>
                
                {/* Send Button */}
                <motion.button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`absolute bottom-4 sm:bottom-6 right-4 sm:right-6 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${
                  inputMessage.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
                whileHover={inputMessage.trim() ? { scale: 1.05 } : {}}
                whileTap={inputMessage.trim() ? { scale: 0.95 } : {}}
                >
                <AnimatePresence mode="wait">
                  {inputMessage.trim() ? (
                  <motion.div
                    key="send"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full" />
                    </motion.div>
                    ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </motion.div>
                  ) : (
                  <motion.div
                    key="idle"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full" />
                    </motion.div>
                    ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </motion.div>
                  )}
                </AnimatePresence>
                </motion.button>
              </div>
              </form>

              {/* Subtle Animation Bar */}
              <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ 
                width: inputMessage.trim() ? "100%" : "0%" 
              }}
              transition={{ duration: 0.3 }}
              />
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {!connected && remainingMessages <= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-lg"
              >
                <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-orange-300">Running low on free messages!</p>
                  <p className="text-[10px] sm:text-xs text-orange-300/80 mt-1">
                  Connect your Solana wallet for unlimited premium AI chat (0.001 SOL)
                  </p>
                </div>
                </div>
              </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {connected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-1.5 sm:p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 backdrop-blur-lg"
              >
                <div className="flex items-center justify-center gap-2 text-[9px] sm:text-sm text-green-300">
                <Star className="w-3 h-3" />
                <span>Premium chat available! Pay 0.001 SOL for unlimited messages</span>
                </div>
              </motion.div>
              )}
            </AnimatePresence>

            {/* Keyboard Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 text-center"
            >
              <p className="text-white/30 text-xs hidden sm:block">
              Press <kbd className="px-2 py-1 bg-white/5 rounded text-xs">Enter</kbd> to send or{' '}
              <kbd className="px-2 py-1 bg-white/5 rounded text-xs">Shift + Enter</kbd> for new line
              </p>
            </motion.div>
            </div>

          {/* Payment Modal */}
          {showPaymentModal && (
            <SolanaPaymentModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              onPaymentSuccess={handlePaymentSuccess}
              query='AI chat session'
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}