'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoaderProps {
  variant?: 'default' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function Loader({ 
  variant = 'default', 
  size = 'md', 
  className,
  text 
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn(
              "rounded-full bg-primary",
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
        {text && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 text-sm text-muted-foreground"
          >
            {text}
          </motion.span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("flex flex-col items-center space-y-3", className)}>
        <motion.div
          className={cn(
            "rounded-full bg-gradient-to-r from-primary/20 to-primary/40 border-2 border-primary/30",
            sizeClasses[size]
          )}
          animate={{
            scale: [1, 1.1, 1],
            borderRadius: ["50%", "45%", "50%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn("space-y-4", className)}>
        <motion.div
          className="h-12 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl"
          animate={{
            background: [
              "linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)",
              "linear-gradient(90deg, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 75%)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="h-8 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg w-3/4"
          animate={{
            background: [
              "linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)",
              "linear-gradient(90deg, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 75%)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.2,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="h-8 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg w-1/2"
          animate={{
            background: [
              "linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)",
              "linear-gradient(90deg, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 75%)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.4,
            ease: "easeInOut"
          }}
        />
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <motion.div
        className={cn(
          "border-2 border-muted border-t-primary rounded-full",
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// User Card Skeleton specifically for user loading
export function UserCardSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-xl border border-border/30 p-6 max-w-sm mx-auto",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Profile Picture Skeleton */}
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-r from-muted/50 to-muted/30"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1))",
              "linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1), rgba(255,255,255,0.2))",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Name Skeleton */}
        <motion.div
          className="h-6 w-32 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg"
          animate={{
            background: [
              "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1))",
              "linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1), rgba(255,255,255,0.2))",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.2,
            ease: "easeInOut"
          }}
        />

        {/* Status Skeleton */}
        <motion.div
          className="h-8 w-24 bg-gradient-to-r from-muted/50 to-muted/30 rounded-full"
          animate={{
            background: [
              "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1))",
              "linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1), rgba(255,255,255,0.2))",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.4,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}
