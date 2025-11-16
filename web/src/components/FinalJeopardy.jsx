import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FinalJeopardy({ finalData, score, setScore, onComplete }) {
  const [showWager, setShowWager] = useState(true)
  const [showQuestion, setShowQuestion] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [wager, setWager] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [finalScore, setFinalScore] = useState(score)

  const correctAudioRef = useRef(null)
  const incorrectAudioRef = useRef(null)

  useEffect(() => {
    correctAudioRef.current = new Audio('/correct.mp3')
    incorrectAudioRef.current = new Audio('/incorrect.mp3')
    
    return () => {
      correctAudioRef.current?.pause()
      incorrectAudioRef.current?.pause()
    }
  }, [])

  useEffect(() => {
    if (showResult) {
      if (isCorrect) {
        correctAudioRef.current?.play().catch(() => {})
      } else if (userAnswer) {
        incorrectAudioRef.current?.play().catch(() => {})
      }
    }
  }, [showResult, isCorrect, userAnswer])

  // Helper function to normalize answers for comparison
  const normalizeAnswer = (answer) => {
    if (!answer) return ''
    
    let normalized = answer.trim().toLowerCase().replace(/[^\w\s]/g, '')
    
    const questionPrefixes = [
      /^what\s+is\s+/i,
      /^what\s+are\s+/i,
      /^who\s+is\s+/i,
      /^who\s+are\s+/i,
      /^where\s+is\s+/i,
      /^where\s+are\s+/i,
      /^when\s+is\s+/i,
      /^when\s+are\s+/i,
      /^how\s+is\s+/i,
      /^how\s+are\s+/i,
      /^which\s+is\s+/i,
      /^which\s+are\s+/i
    ]
    
    for (const prefix of questionPrefixes) {
      normalized = normalized.replace(prefix, '').trim()
    }
    
    return normalized.trim()
  }

  const compareAnswers = (userAns, correctAns) => {
    // Empty answers are always incorrect
    if (!userAns || !userAns.trim()) return false
    
    const userNorm = normalizeAnswer(userAns)
    const correctNorm = normalizeAnswer(correctAns)
    
    // If normalized user answer is empty, it's incorrect
    if (!userNorm || userNorm.length === 0) return false
    
    if (userNorm === correctNorm) return true
    if (userNorm.includes(correctNorm) || correctNorm.includes(userNorm)) return true
    
    const userSingular = userNorm.replace(/s$/, '')
    const correctSingular = correctNorm.replace(/s$/, '')
    
    if (userSingular === correctNorm || userNorm === correctSingular) return true
    if (userSingular === correctSingular && userSingular.length > 0) return true
    
    if (userNorm.endsWith('s') && userNorm.slice(0, -1) === correctNorm) return true
    if (correctNorm.endsWith('s') && correctNorm.slice(0, -1) === userNorm) return true
    
    return false
  }

  const handleWagerSubmit = () => {
    const wagerAmount = parseInt(wager) || 0
    const maxWager = Math.max(0, score) // Can't wager negative
    const finalWager = Math.max(0, Math.min(wagerAmount, maxWager))
    setWager(finalWager.toString())
    setShowWager(false)
    setShowQuestion(true)
  }

  const handleSubmit = () => {
    const wagerAmount = parseInt(wager) || 0
    const correct = compareAnswers(userAnswer, finalData.answer)
    setIsCorrect(correct)
    setShowResult(true)
    
    const newScore = correct ? score + wagerAmount : score - wagerAmount
    setFinalScore(newScore)
    setScore(newScore)
  }

  const handleContinue = () => {
    onComplete()
  }

  if (showWager) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-8"
        style={{
          background: 'linear-gradient(135deg, #0A0F99 0%, #071277 50%, #0A0F99 100%)',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-4xl w-full"
        >
          <div className="bg-yellow-500 border-8 border-yellow-300 p-12 rounded-3xl text-center shadow-2xl">
            <div className="text-white text-6xl font-black mb-8" style={{ fontFamily: 'Georgia, serif', textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
              FINAL JEOPARDY!
            </div>
            <div className="text-white text-4xl font-bold mb-8" style={{ fontFamily: 'Georgia, serif' }}>
              Category: {finalData.category}
            </div>
            <div className="text-white text-3xl font-bold mb-8" style={{ fontFamily: 'Georgia, serif' }}>
              Current Score: ${score}
            </div>
            <div className="bg-black bg-opacity-40 p-6 rounded-xl mb-8">
              <label className="block text-yellow-300 text-2xl font-bold mb-4">
                ENTER YOUR WAGER
              </label>
              <input
                type="number"
                value={wager}
                onChange={(e) => setWager(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleWagerSubmit()}
                className="w-full px-6 py-4 text-3xl text-center font-bold rounded-xl border-4 border-white bg-white text-black focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all"
                style={{ fontFamily: 'Georgia, serif' }}
                placeholder={`Max: $${Math.max(0, score)}`}
                min="0"
                max={Math.max(0, score)}
                autoFocus
              />
              <div className="text-white text-xl mt-4">
                Maximum wager: ${Math.max(0, score)} (You can wager $0)
              </div>
            </div>
            <button
              className="px-16 py-5 bg-white text-blue-900 rounded-2xl hover:bg-yellow-300 font-black text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all"
              onClick={handleWagerSubmit}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              CONFIRM WAGER
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (showQuestion && !showResult) {
    return (
      <div className="fixed inset-0 z-50"
        style={{
          background: 'linear-gradient(135deg, #0A0F99 0%, #071277 50%, #0A0F99 100%)',
        }}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full w-full flex flex-col items-center justify-center px-8"
        >
          <div className="text-white text-center max-w-6xl mb-8">
            <div className="text-4xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              FINAL JEOPARDY!
            </div>
            <div className="text-2xl font-semibold mb-8" style={{ fontFamily: 'Georgia, serif' }}>
              Category: {finalData.category}
            </div>
            <div 
              className="text-white text-center"
              style={{
                fontFamily: 'Georgia, "ITC Korinna", serif',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.1)',
              }}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-wide uppercase"
                style={{ letterSpacing: '0.02em' }}
              >
                {finalData.question}
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="w-full max-w-3xl"
          >
            <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-8 border-2 border-white border-opacity-20">
              <label className="block text-white text-xl font-semibold mb-4 text-center tracking-wide">
                YOUR ANSWER
              </label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full px-6 py-4 text-2xl text-center font-bold rounded-xl border-4 border-white bg-white text-black focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all"
                style={{ fontFamily: 'Georgia, serif' }}
                autoFocus
              />
              
              <div className="flex justify-center gap-6 mt-6">
                <button
                  className="px-10 py-4 bg-green-600 text-white rounded-xl hover:bg-green-500 font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  onClick={handleSubmit}
                >
                  SUBMIT
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (showResult) {
    const wagerAmount = parseInt(wager) || 0
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-8"
        style={{
          background: 'linear-gradient(135deg, #0A0F99 0%, #071277 50%, #0A0F99 100%)',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-4xl w-full"
        >
          <div className={`p-12 rounded-3xl text-center shadow-2xl ${
            isCorrect 
              ? 'bg-green-600 border-8 border-green-400' 
              : 'bg-red-600 border-8 border-red-400'
          }`}>
            {isCorrect ? (
              <>
                <div className="text-7xl mb-6 animate-bounce">✅</div>
                <div className="text-white text-5xl font-black mb-4" style={{ fontFamily: 'Georgia, serif', textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
                  CORRECT!
                </div>
                <div className="text-white text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  You earned ${wagerAmount}!
                </div>
                <div className="text-white text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                  Final Score: ${finalScore}
                </div>
              </>
            ) : (
              <>
                <div className="text-7xl mb-6">❌</div>
                <div className="text-white text-5xl font-black mb-4" style={{ fontFamily: 'Georgia, serif', textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
                  INCORRECT!
                </div>
                <div className="bg-black bg-opacity-40 p-6 rounded-xl mt-6 mb-6">
                  <div className="text-yellow-300 text-2xl font-bold mb-2">CORRECT ANSWER:</div>
                  <div className="text-white text-4xl font-bold uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                    {finalData.answer}
                  </div>
                </div>
                <div className="text-white text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  You lost ${wagerAmount}!
                </div>
                <div className="text-white text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                  Final Score: ${finalScore}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center mt-12">
            <button
              className="px-16 py-5 bg-white text-blue-900 rounded-2xl hover:bg-yellow-300 font-black text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all"
              onClick={handleContinue}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              PLAY AGAIN
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}

