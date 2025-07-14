"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Grid, List, Clock, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArticleCard } from "@/components/article-card"

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
  category?: string
  trending?: boolean
}

export function ArticlesSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categories = ["all", "Technology", "Blockchain", "Social Media", "Cryptography"]

  // Fetch articles on component mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "trending articles", offset: 0, limit: 20 }),
        })
        const data = await res.json()
        
        if (data.body?.articles) {
          // Transform API data to match our interface
          const transformedArticles = data.body.articles.map((article: any) => ({
            ...article,
            category: article.category || "Technology",
            trending: (article.stats?.popularity || 0) > 10,
          }))
          setArticles(transformedArticles)
        } else {
          setError("No articles found")
        }
      } catch (err) {
        setError("Failed to load articles")
        console.error("Error fetching articles:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex-1 flex flex-col">
      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <div className="flex border border-gray-200 rounded-md">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              {category === "all" ? "All Categories" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">Loading articles...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="bg-transparent"
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">{filteredArticles.length} articles found</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>Trending topics</span>
              </div>
            </div>

            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {filteredArticles.map((article) => (
                <div key={article.id} className="relative">
                  {article.trending && <Badge className="absolute top-2 right-2 z-10 bg-orange-500">Trending</Badge>}
                  {viewMode === "grid" ? (
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-4">
                        <img
                          src={article.thumbnail || "/placeholder.svg"}
                          alt={article.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <div className="space-y-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                          <h3 className="font-medium text-gray-900 line-clamp-2">{article.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-3">{article.excerpt}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{article.authorName}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{article.readTime}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <ArticleCard article={article} />
                  )}
                </div>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No articles found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
