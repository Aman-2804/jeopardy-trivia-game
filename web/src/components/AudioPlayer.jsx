import React, { useEffect, useRef, useState } from 'react'

// AudioPlayer: loads /jeopardy-themelq.mp3 from public and starts playback
// after the user interacts (to satisfy browser autoplay restrictions). Exposes mute/unmute.
export default function AudioPlayer({ startOnUserGesture = true }) {
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const a = new Audio('/jeopardy-themelq.mp3')
    a.loop = true
    a.preload = 'auto'
    audioRef.current = a

    const tryAutoplay = async () => {
      try {
        await a.play()
      } catch (e) {
        // Autoplay blocked by browser — we'll rely on user gesture to unmute.
      }
    }

    tryAutoplay()

    return () => {
      try { a.pause(); a.src = '' } catch (e) {}
    }
  }, [])

  const toggleMute = () => {
    const a = audioRef.current
    if (!a) return
    a.muted = !a.muted
    setMuted(a.muted)
    // If unmuting and the audio hasn't started, try to play
    if (!a.muted) a.play().catch(() => {})
  }

  return (
    <div className="flex items-center">
      <button
        className="px-2 py-1 bg-gray-800 text-white rounded"
        onClick={toggleMute}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}
