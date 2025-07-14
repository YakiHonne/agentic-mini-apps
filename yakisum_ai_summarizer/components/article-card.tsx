"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface Article {
  id: string
  title: string
  author: string
  authorName: string
  timeAgo: string
  readTime: string
  excerpt: string
  thumbnail: string
  url: string
}

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer relative">
      <CardContent className="p-4">
        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{article.authorName}</span>
              <span className="text-xs text-gray-500">• {article.timeAgo}</span>
              <span className="text-xs text-orange-500 ml-2">{article.readTime} read</span>
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 leading-tight">{article.title}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{article.excerpt}</p>
          </div>
          <img
            src={article.thumbnail || "/placeholder.svg"}
            alt={article.title}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0 border"
          />
        </div>
        {/* External link icon at bottom right */}
        <div className="absolute bottom-3 right-3">
          <Link href={article.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-5 h-5 text-gray-400 hover:text-orange-500 transition-colors" />
            <span className="sr-only">Open in Yakihonne</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
