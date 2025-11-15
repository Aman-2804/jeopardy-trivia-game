import React, { useEffect } from 'react'

export default function AudioPlayer() {
  useEffect(() => {
    const a = new Audio('/jeopardy-themelq.mp3')
    a.preload = 'auto'
    a.volume = 0.5
    let hasStarted = false

    const startPlayback = async () => {
      if (hasStarted) return
      try {
        await a.play()
        hasStarted = true
      } catch (e) {}
    }

    startPlayback()

    const startOnInteraction = () => {
      if (!hasStarted) startPlayback()
    }

    const events = ['click', 'keydown', 'touchstart', 'mousedown']
    events.forEach(event => {
      document.addEventListener(event, startOnInteraction, { once: true, passive: true })
    })

    const handleEnded = () => {
      a.currentTime = 0
      a.play().catch(() => {})
    }
    
    const handleTimeUpdate = () => {
      if (a.duration > 0 && a.currentTime > 0 && (a.duration - a.currentTime) < 0.05) {
        a.currentTime = 0
      }
    }
    
    a.addEventListener('ended', handleEnded)
    a.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      try { 
        a.pause()
        a.src = ''
        a.removeEventListener('ended', handleEnded)
        a.removeEventListener('timeupdate', handleTimeUpdate)
        events.forEach(event => {
          document.removeEventListener(event, startOnInteraction)
        })
      } catch (e) {}
    }
  }, [])

  return null
}
