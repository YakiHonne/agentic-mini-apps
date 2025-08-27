"use client"

import { useState } from "react"
import { Search, Trash2, MessageSquare, Calendar, ArrowRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageBubble } from "@/components/message-bubble"
import { useChatHistory } from "@/hooks/use-chat-history"

export function SavedSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const { savedChats, removeSavedChat, loadChat } = useChatHistory()

  const filteredChats = savedChats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

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

  const handleContinueChat = (chat: any) => {
    loadChat(chat.id)
    // Navigate to AI Agent section - you might want to add navigation logic here
    window.location.hash = "ai-agent"
  }

  const getChatSummary = (messages: any[]) => {
    const userMessages = messages.filter((msg) => msg.type === "user")
    const aiMessages = messages.filter((msg) => msg.type === "ai")
    return {
      userQuestions: userMessages.length,
      aiResponses: aiMessages.length,
      firstQuestion: userMessages[0]?.content || "",
      lastResponse: aiMessages[aiMessages.length - 1]?.content || "",
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Saved Chats</h2>
              <p className="text-sm text-gray-600">{savedChats.length} chats saved</p>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search saved chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Saved Chats */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {filteredChats.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredChats.map((chat) => (
                <Card key={chat.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">{chat.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {chat.messages[1]?.content || "No messages"}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Saved {formatTimeAgo(chat.timestamp)}</span>
                              </div>
                              <span>{chat.messages.length} messages</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 flex-shrink-0"
                          onClick={() => removeSavedChat(chat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleContinueChat(chat)}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Continue Chat
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedChat(chat)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="line-clamp-2">{chat.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700">Messages:</span>
                                    <span className="ml-2">{chat.messages.length}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Saved:</span>
                                    <span className="ml-2">{formatTimeAgo(chat.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {chat.messages.map((message: any) => (
                                  <MessageBubble key={message.id} message={message} />
                                ))}
                              </div>
                              <div className="flex gap-2 pt-4 border-t">
                                <Button
                                  onClick={() => handleContinueChat(chat)}
                                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                  <ArrowRight className="h-4 w-4 mr-2" />
                                  Continue This Chat
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved chats</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? "No chats match your search." : "Save your favorite conversations to access them later."}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
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
