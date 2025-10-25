import React, { useState, useEffect } from 'react'
import Board from './components/Board'
import Score from './components/Score'
import AudioPlayer from './components/AudioPlayer'

const API_URL = 'http://localhost:3001'

export default function App() {
  const [data, setData] = useState(null)
  const [showId, setShowId] = useState(null)
  const [showNumber, setShowNumber] = useState(null)
  const [approxYear, setApproxYear] = useState(null)
  const [round, setRound] = useState('jeopardy')
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRandomGame = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/random-game`)
      if (!response.ok) throw new Error('Failed to load game')
      const gameData = await response.json()
      setData({ categories: gameData.categories })
      setShowId(gameData.showId)
      setShowNumber(gameData.showNumber)
      setApproxYear(gameData.approxYear)
      setRound('jeopardy')
      setScore(0)
    } catch (err) {
      console.error('Error loading game:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadDoubleJeopardy = async () => {
    if (!showId) return
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/game/${showId}/double`)
      if (!response.ok) throw new Error('Failed to load double jeopardy')
      const doubleData = await response.json()
      setData({ categories: doubleData.categories })
      setRound('double')
    } catch (err) {
      console.error('Error loading double jeopardy:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRandomGame()
  }, [])

  if (loading) return <div className="p-8 text-white text-center text-2xl">Loading game...</div>
  if (error) return <div className="p-8 text-red-500 text-center text-2xl">Error: {error}</div>
  if (!data) return <div className="p-8 text-white text-center text-2xl">No game data</div>

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 bg-black border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--money-gold)' }}>
            JEOPARDY!
          </h1>
          {showNumber && (
            <p className="text-white text-sm mt-1">
              Game #{showNumber} from {approxYear}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Score score={score} />
          <AudioPlayer startOnUserGesture={false} />
          <button
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            onClick={() => {
              if (round === 'jeopardy') {
                loadDoubleJeopardy()
              }
            }}
          >
            Next Round
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-bold"
            onClick={loadRandomGame}
          >
            New Game
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 bg-black">
        <Board data={data} round={round} score={score} setScore={setScore} />
      </main>
    </div>
  )
}
