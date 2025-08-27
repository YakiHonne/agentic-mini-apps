"use client"

import { useState } from "react"
import { Search, MessageSquare, Trash2, Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useChatHistory } from "@/hooks/use-chat-history"

const ITEMS_PER_PAGE = 12

export function HistorySection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { history, removeFromHistory } = useChatHistory()

  const filteredHistory = history.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const loadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Chat History</h2>
              <p className="text-sm text-gray-600">{history.length} total conversations</p>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search chat history..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {paginatedHistory.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedHistory.map((chat) => (
                  <Card key={chat.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">{chat.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {chat.messages[1]?.content || "No messages"}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatTimeAgo(chat.timestamp)}</span>
                              </div>
                              <span>{chat.messages.length} messages</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 flex-shrink-0"
                          onClick={() => removeFromHistory(chat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={loadMore} className="w-full sm:w-auto bg-transparent">
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More ({filteredHistory.length - currentPage * ITEMS_PER_PAGE} remaining)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chat history</h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "No chats match your search."
                  : "Start a conversation with the AI agent to see your history here."}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
