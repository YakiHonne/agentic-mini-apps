"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Zap, RefreshCw, AlertCircle, User } from "lucide-react"
import { widgetConfig } from "@/lib/widget-config"
import SWHandler from "smart-widget-handler"

interface NostrUser {
  pubkey: string
  display_name?: string
  name?: string
  picture?: string
  banner?: string
  nip05?: string
  lud16?: string
  lud06?: string
  website?: string
}

export default function ZapTrackerWidget() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [user, setUser] = useState<NostrUser | null>(null)
  const [isWidgetReady, setIsWidgetReady] = useState(false)

  useEffect(() => {
    // Notify YakiHonne that the widget is ready
    SWHandler.client.ready()
    setIsWidgetReady(true)

    // Listen for messages from YakiHonne parent
    const listener = SWHandler.client.listen((data) => {
      console.log("Received message from YakiHonne:", data)

      if (data.kind === "user-metadata") {
        setUser(data.data.user)
        console.log("User data received:", data.data.user)
      } else if (data.kind === "nostr-event") {
        if (data.data.status === "success") {
          console.log("Event signed/published successfully:", data.data.event)
        } else if (data.data.status === "error") {
          console.error("Event signing/publishing failed:", data.data.error)
        }
      }
    })

    // Cleanup listener on unmount
    return () => listener.close()
  }, [])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError(true)
  }

  const refreshWidget = () => {
    setIsLoading(true)
    setError(false)
    const iframe = document.getElementById("zap-tracker-iframe") as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }

  const handlePublishZap = () => {
    if (!user) {
      console.warn("No user data available for publishing")
      return
    }

    const eventDraft = {
      content: `Zap activity tracked via ZapTracker widget`,
      tags: [
        ["t", "zap"],
        ["t", "zaptracker"],
        ["t", "yakihonne-widget"],
      ],
      kind: 1,
    }

    // Request YakiHonne to sign and publish the event
    SWHandler.client.requestEventPublish(eventDraft, window.location.ancestorOrigins?.[0] || "*")
  }

  const sendCustomContext = () => {
    const customData = {
      action: "widget-interaction",
      widget: "zaptracker",
      timestamp: Date.now(),
      data: {
        user_pubkey: user?.pubkey,
        interaction_type: "custom_action",
      },
    }

    SWHandler.client.sendContext(JSON.stringify(customData), window.location.ancestorOrigins?.[0] || "*")
  }

  const appUrl = widgetConfig?.widget?.appUrl || "https://zap-tracker.netlify.app/"
  const iconUrl = widgetConfig?.widget?.iconUrl || "/logo.png"
  const title = widgetConfig?.widget?.title || "ZapTracker"

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* Widget Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={iconUrl || "/placeholder.svg"}
              alt={`${title} icon`}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) {
                  fallback.classList.remove("hidden")
                }
              }}
            />
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center hidden">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-lg">{title}</h1>
            <p className="text-sm text-gray-500">Lightning Insights Widget</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 px-2 py-1 bg-orange-50 rounded-lg">
              {user.picture ? (
                <img
                  src={user.picture || "/placeholder.svg"}
                  alt={user.display_name || user.name || "User"}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-orange-600" />
              )}
              <span className="text-sm text-orange-800">{user.display_name || user.name || "User"}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={refreshWidget}
            disabled={isLoading}
            className="h-9 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(appUrl, "_blank")} className="h-9">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Nostr Integration Controls */}
      {isWidgetReady && user && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-800">Nostr Integration Active</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handlePublishZap}
                className="bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs"
              >
                Publish Zap Note
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={sendCustomContext}
                className="h-8 text-xs border-orange-300 text-orange-700 hover:bg-orange-100 bg-transparent"
              >
                Send Context
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
                <img
                  src={iconUrl || "/placeholder.svg"}
                  alt={`${title} loading`}
                  className="w-full h-full object-cover animate-pulse"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) {
                      fallback.classList.remove("hidden")
                    }
                  }}
                />
                <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center hidden">
                  <Zap className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading {title}...</h3>
              <p className="text-gray-600">Please wait while we load your dashboard</p>
              {isWidgetReady && <p className="text-sm text-green-600 mt-2">✓ Connected to YakiHonne</p>}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <Card className="p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load</h3>
              <p className="text-gray-600 mb-6">Unable to load {title}. Please check your connection and try again.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={refreshWidget} className="bg-orange-500 hover:bg-orange-600">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button variant="outline" onClick={() => window.open(appUrl, "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Direct
                </Button>
              </div>
            </Card>
          </div>
        )}

        <iframe
          id="zap-tracker-iframe"
          src={appUrl}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={`${title} Dashboard`}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
          allow="clipboard-read; clipboard-write"
        />
      </div>

      {/* Widget Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>YakiHonne Widget v1.0.0</span>
          <div className="flex items-center gap-4">
            <span>Powered by Nostr</span>
            <span>by Pratik Patel</span>
            {isWidgetReady && <span className="text-green-600">✓ Connected</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
