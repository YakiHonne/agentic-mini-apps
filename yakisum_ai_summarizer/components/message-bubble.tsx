"use client"

import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: string | Date
  title?: string;
  postId?: string;
  author?: string;
}

interface MessageBubbleProps {
  message: Message
  onRepost?: (message: Message) => void;
}

export function MessageBubble({ message, onRepost }: MessageBubbleProps) {
  const isUser = message.type === "user"

  // Ensure we always have a Date instance to avoid runtime errors
  const date = typeof message.timestamp === "string" ? new Date(message.timestamp) : message.timestamp

  // Only show repost button for real summaries, not for feedback, error, or generic titles
  const isSummary =
    !isUser &&
    onRepost &&
    message.title &&
    message.title.trim().length > 0 &&
    !/^not found$/i.test(message.title.trim()) &&
    !/^found \d+ articles\.?$/i.test(message.title.trim()) &&
    !/^yakisum assistant$/i.test(message.title.trim());

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser ? "bg-orange-500 text-white" : "bg-white border border-gray-200",
        )}
      >
        {/* Show title and postId for AI messages if present */}
        {!isUser && message.title && (
          <>
            <p className="text-base font-semibold text-gray-900 mb-0.5">{message.title}</p>
           
          </>
        )}
        <p className="text-sm">{message.content}</p>
        <p className={cn("text-xs mt-1", isUser ? "text-orange-100" : "text-gray-500")}>
          {date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {/* Repost button for AI summary messages only (not feedback/greeting/errors) */}
        {isSummary && (
          <div className="flex justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={() => onRepost(message)}
            >
              <Repeat className="h-4 w-4" />
              Repost to Yakisum
            </Button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-gray-600" />
        </div>
      )}
    </div>
  )
}
