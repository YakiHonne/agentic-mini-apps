"use client"

import { useState, useEffect } from "react"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: string | Date
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  timestamp: string
}

export function useChatHistory() {
  const [history, setHistory] = useState<ChatSession[]>([])
  const [savedChats, setSavedChats] = useState<ChatSession[]>([])
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("yakihonne_chat_history")
    const savedFavorites = localStorage.getItem("yakihonne_saved_chats")

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }

    if (savedFavorites) {
      setSavedChats(JSON.parse(savedFavorites))
    }
  }, [])

  const addToHistory = (chat: ChatSession) => {
    setHistory((prev) => {
      const updated = [chat, ...prev.filter((c) => c.id !== chat.id)]
      localStorage.setItem("yakihonne_chat_history", JSON.stringify(updated))
      return updated
    })
  }

  const saveChat = (chat: ChatSession) => {
    setSavedChats((prev) => {
      const updated = [chat, ...prev.filter((c) => c.id !== chat.id)]
      localStorage.setItem("yakihonne_saved_chats", JSON.stringify(updated))
      return updated
    })
  }

  const removeSavedChat = (chatId: string) => {
    setSavedChats((prev) => {
      const updated = prev.filter((c) => c.id !== chatId)
      localStorage.setItem("yakihonne_saved_chats", JSON.stringify(updated))
      return updated
    })
  }

  const removeFromHistory = (chatId: string) => {
    setHistory((prev) => {
      const updated = prev.filter((c) => c.id !== chatId)
      localStorage.setItem("yakihonne_chat_history", JSON.stringify(updated))
      return updated
    })
  }

  const isChatSaved = (chatId: string) => {
    return savedChats.some((chat) => chat.id === chatId)
  }

  const loadChat = (chatId: string) => {
    const chat = history.find((c) => c.id === chatId) || savedChats.find((c) => c.id === chatId)
    if (chat) {
      setActiveChat(chat)
      return chat
    }
    return null
  }

  const clearActiveChat = () => {
    setActiveChat(null)
  }

  return {
    history,
    savedChats,
    activeChat,
    addToHistory,
    saveChat,
    removeSavedChat,
    removeFromHistory,
    isChatSaved,
    loadChat,
    clearActiveChat,
  }
}
