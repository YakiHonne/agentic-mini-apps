'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Quote, 
  BookOpen, 
  Tag,
  BarChart3,
  Sparkles,
  Users,
  Clock,
  Target
} from 'lucide-react';
import { DeepAnalysis } from '@/types/curate';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DeepAnalysisResultsProps {
  analysis: DeepAnalysis;
  totalEventsAnalyzed: number;
  expandedQueries: string[];
}

const DeepAnalysisResults: React.FC<DeepAnalysisResultsProps> = ({
  analysis,
  totalEventsAnalyzed,
  expandedQueries
}) => {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'bearish': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'border-green-500/30 bg-green-500/10';
      case 'bearish': return 'border-red-500/30 bg-red-500/10';
      default: return 'border-yellow-500/30 bg-yellow-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 mb-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Deep Analysis Report</h2>
            <p className="text-purple-200/80 text-sm">
              AI-powered comprehensive research analysis
            </p>
          </div>
        </div>

        {/* Meta Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-300" />
              <span className="text-purple-200">Events Analyzed</span>
            </div>
            <div className="text-white font-semibold">{totalEventsAnalyzed}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-300" />
              <span className="text-blue-200">Search Terms</span>
            </div>
            <div className="text-white font-semibold">{expandedQueries.length}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-300" />
              <span className="text-green-200">Categories</span>
            </div>
            <div className="text-white font-semibold">{analysis.categories.length}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-300" />
              <span className="text-orange-200">Confidence</span>
            </div>
            <div className="text-white font-semibold">{analysis.sentimentAnalysis.confidence}%</div>
          </div>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {analysis.executiveSummary}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sentiment Analysis */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className={`${getSentimentColor(analysis.sentimentAnalysis.overall)} backdrop-blur-xl border`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getSentimentIcon(analysis.sentimentAnalysis.overall)}
              Sentiment Analysis
              <Badge variant="outline" className="ml-auto">
                {analysis.sentimentAnalysis.confidence}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Sentiment:</span>
                <Badge 
                  variant={analysis.sentimentAnalysis.overall === 'bullish' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {analysis.sentimentAnalysis.overall}
                </Badge>
              </div>
              
              {/* Sentiment Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Positive</span>
                  <span>{analysis.sentimentAnalysis.breakdown.positive}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(analysis.sentimentAnalysis.breakdown.positive / totalEventsAnalyzed) * 100}%` 
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Neutral</span>
                  <span>{analysis.sentimentAnalysis.breakdown.neutral}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(analysis.sentimentAnalysis.breakdown.neutral / totalEventsAnalyzed) * 100}%` 
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Negative</span>
                  <span>{analysis.sentimentAnalysis.breakdown.negative}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(analysis.sentimentAnalysis.breakdown.negative / totalEventsAnalyzed) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Findings & Trending Narratives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Key Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.keyFindings.map((finding, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-foreground">{finding}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trending Narratives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.trendingNarratives.map((narrative, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Badge variant="secondary" className="mr-2 mb-2">
                      #{narrative}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Notable Quotes */}
      {analysis.notableQuotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-primary" />
                Notable Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.notableQuotes.map((quote, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.2 }}
                    className="border-l-4 border-primary pl-4"
                  >
                    <blockquote className="text-foreground italic mb-2">
                      "{quote.content}"
                    </blockquote>
                    <p className="text-xs text-muted-foreground">{quote.context}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Categories Breakdown */}
      {analysis.categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Content Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.categories.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="bg-background/50 rounded-lg p-4 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{category.name}</h4>
                      <Badge variant="outline">{category.count}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Expanded Search Terms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-muted/30 rounded-xl p-4"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Search Terms Used:
        </h3>
        <div className="flex flex-wrap gap-2">
          {expandedQueries.map((query, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {query}
            </Badge>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeepAnalysisResults;
