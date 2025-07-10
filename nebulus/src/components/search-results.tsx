'use client'

import { AnimatePresence } from 'framer-motion'
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { CheckCircle2, Copy, ExternalLink, Zap } from 'lucide-react'
import { NostrPost } from '@/app/page-old'

interface Props {
    searchResults: Array<NostrPost>,
    showResults: boolean,
    selectedPosts: Set<string>,
    handleAddToNote: () => void,
    handlePostSelection: (postId: string) => void
}

const SearchResults: React.FC<Props> = ({ searchResults, showResults, selectedPosts, handleAddToNote, handlePostSelection }) => {
  return (
    <div>
        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Research Results</h2>
                {selectedPosts.size > 0 && (
                  <Button
                    onClick={handleAddToNote}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Add to Note ({selectedPosts.size})
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                {searchResults.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedPosts.has(post.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handlePostSelection(post.id)}
                  >
                    <div className="space-y-4">
                      {/* Post Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">{post.author[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium">{post.author}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Zap className="w-4 h-4" />
                            <span>{post.zaps}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>💬</span>
                            <span>{post.replies}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Summary (for Deep Analysis) */}
                      {post.summary && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs">🤖</span>
                            </div>
                            <p className="text-sm italic text-primary-foreground/90">{post.summary}</p>
                          </div>
                        </div>
                      )}

                      {/* Post Content */}
                      <p className="text-sm line-clamp-3">{post.content}</p>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          {selectedPosts.has(post.id) && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {selectedPosts.has(post.id) ? 'Selected' : 'Click to select'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}

export default SearchResults