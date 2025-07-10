'use client';
;
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import SWHandler from "smart-widget-handler";
import { motion } from "framer-motion";
import ErrMessage from "@/components/err-message";
import Navbar from "@/components/navbar";
import SearchInterface from "@/components/search-interface";
import { toast } from "sonner";
import { useCuratedEvents } from "@/lib/use-curated-events";
import Loader from "@/components/ui/loader";
import Events from "@/components/events";

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

  const [isUserLoading, setIsUserLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const { mutate: fetchCuratedEvents, isPending, data: events } = useCuratedEvents()

  const curatedEvents = events?.curatedEvents || [];

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

  const handleSearch = (query: string, type: string) => {
    if (!query || query.length < 3) {
      toast.error("Please enter at least 3 characters to search.");
      return;
    }

    fetchCuratedEvents({ topic: query, type })
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
      className="flex flex-col flex-1 min-h-[80vh] bg-gradient-to-br from-background via-background to-primary/5 relative"
    >
      <Navbar user={user} />

      <div className="flex-1 p-4 py-5 mt-24 mb-40 max-w-4xl mx-auto">
        {
          isPending ? (<Loader /> ):
          <Events curatedEvents={curatedEvents} />
        }
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <SearchInterface 
            onSearch={(query, type) => handleSearch(query, type)}
            isLoading={isPending}
          />
        </div>
      </div>
    </motion.div>
  );
}
