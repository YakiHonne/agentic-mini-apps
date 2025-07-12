import Loader from '@/components/ui/loader'
import React from 'react'

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
        <Loader variant="pulse" />
    </div>
  )
}

export default Loading