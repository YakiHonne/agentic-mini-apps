'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Sparkles, BarChart3, Lightbulb, CheckCircle } from 'lucide-react';

interface AIThinkingProcessProps {
  type: 'search' | 'deep-analysis';
  query: string;
}

const AIThinkingProcess: React.FC<AIThinkingProcessProps> = ({ type, query }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const searchSteps = [
    { icon: Search, text: `Searching Nostr relays for "${query}"...` },
    { icon: Brain, text: "Processing and ranking results..." },
    { icon: Sparkles, text: "Generating summaries..." },
    { icon: CheckCircle, text: "Processing complete..." }
  ];

  const deepAnalysisSteps = [
    { icon: Brain, text: `Expanding search terms for "${query}"...` },
    { icon: Search, text: "Searching across multiple relays..." },
    { icon: BarChart3, text: "Analyzing sentiment and trends..." },
    { icon: Lightbulb, text: "Extracting key insights..." },
    { icon: Sparkles, text: "Generating comprehensive analysis..." },
    { icon: CheckCircle, text: "Processing complete..." }
  ];

  const steps = type === 'deep-analysis' ? deepAnalysisSteps : searchSteps;

  useEffect(() => {
    const stepDuration = type === 'deep-analysis' ? 3600 : 3000;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsComplete(true);
          return prev; // Stay at the last step
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [steps.length, type]);

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 max-w-2xl">
        <motion.div
          key={currentStep}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative flex-shrink-0"
        >
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg backdrop-blur-sm">
            <Icon className="w-4 h-4 bg-clip-text" 
                  style={{ 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    backgroundImage: 'linear-gradient(to right, rgb(168, 85, 247), rgb(59, 130, 246))'
                  }} />
          </div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent leading-relaxed"
            >
              {currentStepData.text}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIThinkingProcess;
