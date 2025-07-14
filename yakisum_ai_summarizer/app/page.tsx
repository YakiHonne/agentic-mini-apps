"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { SavedSection } from "@/components/saved-section"
import { HistorySection } from "@/components/history-section"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { UserProfile } from "@/components/user-profile"

type ActiveSection = "ai-agent" | "saved" | "history"

export default function YakihonneAIAgent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<ActiveSection>("ai-agent")

  const renderActiveSection = () => {
    switch (activeSection) {
      case "ai-agent":
        return <ChatInterface />
      case "saved":
        return <SavedSection />
      case "history":
        return <HistorySection />
      default:
        return <ChatInterface />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 w-full">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        <div className="lg:hidden">
          <UserProfile />
        </div>
        <Header onMenuClick={() => setSidebarOpen(true)} activeSection={activeSection} />
        <div className="flex-1 overflow-hidden">{renderActiveSection()}</div>
      </div>
    </div>
  )
}
