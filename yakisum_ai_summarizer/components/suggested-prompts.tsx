"use client"

import { Button } from "@/components/ui/button"
import { Search, FileText, TrendingUp, Bookmark } from "lucide-react"

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void
}

export function SuggestedPrompts({ onPromptClick }: SuggestedPromptsProps) {
  const prompts = [
    {
      icon: Search,
      text: "Search for articles about Bitcoin",
      prompt: "Find articles about Bitcoin and cryptocurrency trends",
    },
    {
      icon: FileText,
      text: "Summarize recent tech articles",
      prompt: "Provide a summary of the latest technology articles",
    },
    {
      icon: TrendingUp,
      text: "What's trending in Nostr?",
      prompt: "Show me trending topics and discussions in the Nostr ecosystem",
    },
    {
      icon: Bookmark,
      text: "Recommend articles to read",
      prompt: "Suggest some interesting articles I should read today",
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700">Try asking me about:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start gap-3 h-auto p-4 text-left bg-transparent hover:bg-gray-50 border-gray-200"
            onClick={() => onPromptClick(prompt.prompt)}
          >
            <prompt.icon className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <span className="text-sm leading-relaxed">{prompt.text}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
