"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import SWhandler from "smart-widget-handler"

export function UserProfile() {
  const [isConnected, setIsConnected] = useState(true)
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    SWhandler.client.ready();
    const listener = SWhandler.client.listen((event: any) => {
      if (event.kind === "user-metadata") {
        console.log("User profile event:", event.data?.user);
        setUser(event.data?.user)
        setLoading(false)
      }
      if (event.kind === "err-msg") {
        setUser({
          name: "Error",
          display_name: "Error",
          pubkey: "",
          picture: "/placeholder.svg?height=40&width=40",
        })
        setLoading(false)
      }
    })
    // Fallback timeout
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)
    return () => {
      listener?.close?.()
      clearTimeout(timer)
    }
  }, [])

  const handleCopyPublicKey = async () => {
    try {
      await navigator.clipboard.writeText(user?.pubkey || "")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span>Loading user profile...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span>No user profile found.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={
                user?.picture && user.picture.trim() !== ""
                  ? user.picture
                  : user?.pubkey
                  ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.pubkey)}&colors=F4A261`
                  : user?.name
                  ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.name)}&colors=F4A261`
                  : "/placeholder.svg"
              }
              alt={user?.display_name || user?.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm sm:text-base">{user?.display_name || user?.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-[180px]">
                {user?.pubkey}
              </p>
              <Button size="sm" variant="ghost" className="h-4 w-4 p-0" onClick={handleCopyPublicKey}>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-gray-400" />}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
          <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  )
}
