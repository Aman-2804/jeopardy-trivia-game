import React, { useState, useEffect } from 'react'
import Board from './components/Board'
import Score from './components/Score'

const API_URL = 'http://localhost:3001/api'

export default function App() {
  const [gameId, setGameId] = useState(null)
  const [gameInfo, setGameInfo] = useState(null)
  const [data, setData] = useState(null)
  const [round, setRound] = useState('jeopardy')
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRandomGame = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get random game
      const gameRes = await fetch(`${API_URL}/random-game`)
      if (!gameRes.ok) {
        throw new Error('No games found. Run the scraper to add games to the database.')
      }
      const game = await gameRes.json()
      setGameId(game.id)
      setGameInfo(game)
      
      // Load jeopardy round data
      const dataRes = await fetch(`${API_URL}/game/${game.id}/jeopardy`)
      const gameData = await dataRes.json()
      setData(gameData)
      setRound('jeopardy')
      setScore(0)
    } catch (err) {
      console.error('Error loading game:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadRound = async (roundName) => {
    if (!gameId) return
    try {
      const dataRes = await fetch(`${API_URL}/game/${gameId}/${roundName}`)
      const gameData = await dataRes.json()
      setData(gameData)
      setRound(roundName)
    } catch (err) {
      console.error('Error loading round:', err)
      setError(err.message)
    }
  }

  useEffect(() => {
    loadRandomGame()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-2xl">Loading game from database...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">Error: {error}</div>
          <button
            className="px-6 py-3 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-bold"
            onClick={loadRandomGame}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#000000' }}>
      <header 
        className="flex items-center justify-between p-4 border-b-4"
        style={{
          background: '#000000',
          borderColor: '#060CE9'
        }}
      >
        <div>
          <h1 
            className="text-3xl font-bold" 
            style={{ 
              color: '#FFCC00',
              fontFamily: 'Georgia, "ITC Korinna", "Times New Roman", serif',
              textShadow: '0 3px 6px #010A8C',
            }}
          >
            JEOPARDY!
          </h1>
          {gameInfo && (
            <div 
              className="text-sm mt-1"
              style={{ color: '#FFCC00' }}
            >
              Game #{gameInfo.showNumber} from {gameInfo.approxYear}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Score score={score} />
          <button
            className="px-4 py-2 rounded font-semibold transition-all"
            style={{
              background: '#060CE9',
              color: '#FFCC00',
              border: '2px solid #0031FF'
            }}
            onMouseEnter={(e) => e.target.style.background = '#071DE2'}
            onMouseLeave={(e) => e.target.style.background = '#060CE9'}
            onClick={() => loadRound(round === 'jeopardy' ? 'double' : 'jeopardy')}
          >
            Next Round
          </button>
          <button
            className="px-4 py-2 rounded font-bold transition-all"
            style={{
              background: '#FFCC00',
              color: '#000000',
              border: '2px solid #FFA500'
            }}
            onMouseEnter={(e) => e.target.style.background = '#FFD700'}
            onMouseLeave={(e) => e.target.style.background = '#FFCC00'}
            onClick={loadRandomGame}
          >
            New Game
          </button>
        </div>
      </header>

      <main 
        className="flex-1 p-6" 
        style={{ background: '#000000' }}
      >
        <Board data={data} round={round} score={score} setScore={setScore} />
      </main>
    </div>
  )
}
