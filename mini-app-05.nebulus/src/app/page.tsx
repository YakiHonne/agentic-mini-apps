'use client';
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import SWHandler from "smart-widget-handler";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import ErrMessage from "@/components/err-message";
import Navbar from "@/components/navbar";
import SearchInterface from "@/components/search-interface";
import PaymentModal from "@/components/payment-modal";
import SolanaPaymentModal from "@/components/solana-payment-modal";
import PaymentMethodSelector from "@/components/payment-method-selector";
import AIChatInterface from "@/components/ai-chat-interface";
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from "sonner";
import { useCuratedEvents } from "@/lib/use-curated-events";
import Loader from "@/components/ui/loader";
import AIThinkingProcess from "@/components/ai-thinking-process-simple";
import Events from "@/components/events";
import DeepAnalysisResults from "@/components/deep-analysis-results";
import Sidebar from "@/components/sidebar";

export interface NostrPost {
  id: string;
  content: string;
  author: string;
  pubkey: string;
  created_at: number;
  zaps?: number;
  replies?: number;
  summary?: string;
}

export default function Home() {

  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const hostOrigin = useStore((state) => state.origin);
  const setHostOrigin = useStore((state) => state.setOrigin);
  const { publicKey, connected } = useWallet();

  const [isUserLoading, setIsUserLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");
  const [currentSearchType, setCurrentSearchType] = useState<'search' | 'deep-analysis'>('search');
  const [lastQuery, setLastQuery] = useState("");
  const [showAIChat, setShowAIChat] = useState(false);

  const { mutate: fetchCuratedEvents, isPending, data: events } = useCuratedEvents()

  const curatedEvents = events?.curatedEvents || [];
  const deepAnalysis = events?.deepAnalysis;

  useEffect(() => {
      SWHandler.client.ready();
  }, []);

  useEffect(() => {
      let listener = SWHandler.client.listen((event) => {
        if (event.kind === "user-metadata") {
          setUser(event.data?.user);
          setHostOrigin(event.data?.host_origin);
          setIsUserLoading(false);
          console.log("User metadata received:", event.data?.user);
        }
        if (event.kind === "err-msg") {
          setErrMsg(event.data);
          setIsUserLoading(false);
          setLoading(false);
        }
        if (event.kind === "nostr-event") {
          setLoading(false);
          let { pubkey, id } = event.data?.event || {};
          if (!(pubkey && id)) {
          }
        }
      });
  
      let timer = setTimeout(() => {
        setIsUserLoading(false);
        clearTimeout(timer);
      }, 3000);
  
      return () => {
        listener?.close();
        clearTimeout(timer);
      };
    }, [hostOrigin]);

  const handleSearch = (query: string, type: 'search' | 'deep-analysis') => {
    if (!query || query.length < 3) {
      toast.error("Please enter at least 3 characters to search.");
      return;
    }

    setCurrentSearchType(type);
    setLastQuery(query);

    if (type === 'deep-analysis') {
      setPendingQuery(query);
      setShowPaymentModal(true);
    } else {
      fetchCuratedEvents({ topic: query, type });
    }
  }

  const handlePaymentSuccess = (paymentSignature: string, method: 'solana' | 'lightning') => {
    if (pendingQuery) {
      setLastQuery(pendingQuery);
      fetchCuratedEvents({ 
        topic: pendingQuery, 
        type: 'deep-analysis',
        paymentSignature,
        paymentMethod: method
      });
      setPendingQuery("");
    }
    setShowPaymentModal(false);
    toast.success(`Payment confirmed via ${method}! Starting Deep Analysis...`);
  }

  if (errMsg) {
    return (
      <ErrMessage errMsg={errMsg} />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col flex-1"
    >
      <Navbar user={user} />
      <Sidebar user={user} />

      <div className="flex-1 p-4 py-5 mt-24 mb-40 max-w-3xl mx-auto pb-40">
        {isPending ? (
          <AIThinkingProcess 
            type={currentSearchType} 
            query={lastQuery || "your query"}
          />
        ) : events?.type === 'deep-analysis' && deepAnalysis ? (
          <div className="space-y-8">
            <DeepAnalysisResults 
              analysis={deepAnalysis} 
              expandedQueries={events.expandedQueries || []}
              totalEventsAnalyzed={events.totalEventsAnalyzed || 0}
            />
            {curatedEvents.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Curated Events
                </h3>
                <Events curatedEvents={curatedEvents} />
              </div>
            )}
          </div>
        ) : (
          <Events curatedEvents={curatedEvents} />
        )}
      </div>

      <PaymentMethodSelector 
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingQuery("");
        }}
        onPaymentSuccess={handlePaymentSuccess}
        amount={0.001}
        description={`Deep Analysis: ${pendingQuery}`}
        title="Premium Deep Analysis"
      />

      <div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <SearchInterface 
            onSearch={(query, type) => handleSearch(query, type)}
            onOpenChat={() => setShowAIChat(true)}
            isLoading={isPending}
          />
        </div>
      </div>

      {/* AI Chat Interface */}
      <AIChatInterface 
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        onSearch={(query, type) => {
          handleSearch(query, type);
          setShowAIChat(false); // Close chat when performing search
        }}
      />
    </motion.div>
  );
}
