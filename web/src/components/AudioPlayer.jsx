import React, { useEffect, useRef } from 'react'

export default function AudioPlayer() {
  const audioRef = useRef(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    const a = new Audio('/jeopardy-themelq.mp3')
    audioRef.current = a
    a.preload = 'auto'
    a.volume = 0.5
    a.loop = true

    const startPlayback = async () => {
      if (hasStartedRef.current) return
      try {
        await a.play()
        hasStartedRef.current = true
        console.log('Audio started playing')
      } catch (e) {
        console.log('Autoplay blocked, waiting for user interaction')
        // If autoplay is blocked, try again on first user interaction
        const startOnInteraction = () => {
          if (!hasStartedRef.current) {
            a.play()
              .then(() => {
                hasStartedRef.current = true
                console.log('Audio started after user interaction')
              })
              .catch((err) => {
                console.error('Failed to start audio:', err)
              })
          }
        }
        const events = ['click', 'keydown', 'touchstart', 'mousedown']
        events.forEach(event => {
          document.addEventListener(event, startOnInteraction, { once: true, passive: true })
        })
      }
    }

    // Handle if audio pauses unexpectedly
    const handlePause = () => {
      if (hasStartedRef.current && a.paused && document.visibilityState === 'visible') {
        console.log('Audio paused unexpectedly, restarting...')
        a.play().catch((err) => {
          console.error('Failed to restart audio:', err)
        })
      }
    }

    // Handle if audio stops unexpectedly
    const handleStalled = () => {
      if (hasStartedRef.current && a.paused) {
        console.log('Audio stalled, attempting to resume...')
        a.play().catch((err) => {
          console.error('Failed to resume audio:', err)
        })
      }
    }

    // Handle errors
    const handleError = (e) => {
      console.error('Audio error:', e)
      // Try to reload and play again
      a.load()
      if (hasStartedRef.current) {
        a.play().catch((err) => {
          console.error('Failed to restart after error:', err)
        })
      }
    }

    // Ensure audio continues playing when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasStartedRef.current && a.paused) {
        a.play().catch((err) => {
          console.error('Failed to resume on visibility change:', err)
        })
      }
    }

    // Try to play immediately when component mounts
    startPlayback()

    // Add event listeners
    a.addEventListener('pause', handlePause)
    a.addEventListener('stalled', handleStalled)
    a.addEventListener('error', handleError)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Periodically check if audio is still playing and restart if needed
    const checkInterval = setInterval(() => {
      if (hasStartedRef.current && a.paused && document.visibilityState === 'visible') {
        console.log('Audio stopped, restarting...')
        a.play().catch((err) => {
          console.error('Failed to restart in interval check:', err)
        })
      }
    }, 2000) // Check every 2 seconds

    return () => {
      clearInterval(checkInterval)
      try {
        a.pause()
        a.src = ''
        a.removeEventListener('pause', handlePause)
        a.removeEventListener('stalled', handleStalled)
        a.removeEventListener('error', handleError)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      } catch (e) {
        console.error('Error cleaning up audio:', e)
      }
    }
  }, [])

  return null
}
