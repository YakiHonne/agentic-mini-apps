'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'

interface ErrMessageProps {
  errMsg?: string;
}

const ErrMessage: React.FC<ErrMessageProps> = ({ errMsg }) => {
  return (
    <div className="flex flex-col flex-1 min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-destructive">Connection Error</h2>
          <p className="text-muted-foreground max-w-md">{errMsg}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
  )
}

export default ErrMessage