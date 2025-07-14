"use client"

import { X, Zap, Bookmark, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/components/user-profile"
import { cn } from "@/lib/utils"

type ActiveSection = "ai-agent" | "saved" | "history"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeSection: ActiveSection
  onSectionChange: (section: ActiveSection) => void
}

export function Sidebar({ isOpen, onClose, activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { icon: Zap, label: "AI Agent", key: "ai-agent" as const, active: activeSection === "ai-agent" },
    { icon: Bookmark, label: "Saved", key: "saved" as const, active: activeSection === "saved" },
    { icon: History, label: "History", key: "history" as const, active: activeSection === "history" },
  ]

  const handleItemClick = (key: ActiveSection) => {
    onSectionChange(key)
    onClose() // Close sidebar on mobile after selection
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-80 xl:w-96 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <span className="font-semibold text-gray-900">Menu</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop user profile */}
        <div className="hidden lg:block">
          <UserProfile />
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <Button
              key={item.key}
              variant={item.active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12 text-sm sm:text-base",
                item.active && "bg-orange-500 hover:bg-orange-600 text-white",
              )}
              onClick={() => handleItemClick(item.key)}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Bottom info card */}
        <div className="p-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
            <p className="text-sm sm:text-base text-orange-800 font-medium">AI Agent</p>
            <p className="text-xs sm:text-sm text-orange-600 mt-1">
              Search articles, get summaries, and discover related content
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
