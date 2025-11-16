import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Tile({ value, clue, score, setScore }) {
  const [answered, setAnswered] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showWager, setShowWager] = useState(false)
  const [wager, setWager] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const isDailyDouble = clue.isDailyDouble || false
  const finalValue = isDailyDouble ? (wager ? parseInt(wager) : value) : value
  
  const dailyDoubleAudioRef = useRef(null)
  const correctAudioRef = useRef(null)
  const incorrectAudioRef = useRef(null)

  useEffect(() => {
    dailyDoubleAudioRef.current = new Audio('/daily-double.mp3')
    correctAudioRef.current = new Audio('/correct.mp3')
    incorrectAudioRef.current = new Audio('/incorrect.mp3')
    
    return () => {
      dailyDoubleAudioRef.current?.pause()
      correctAudioRef.current?.pause()
      incorrectAudioRef.current?.pause()
    }
  }, [])

  useEffect(() => {
    if (showWager && isDailyDouble) {
      dailyDoubleAudioRef.current?.play().catch(() => {})
    }
  }, [showWager, isDailyDouble])

  useEffect(() => {
    if (showResult) {
      if (isCorrect) {
        correctAudioRef.current?.play().catch(() => {})
      } else if (userAnswer) {
        // Only play incorrect sound if they submitted an answer, not if they passed
        incorrectAudioRef.current?.play().catch(() => {})
      }
    }
  }, [showResult, isCorrect, userAnswer])

  const handleClick = () => {
    if (!answered) {
      if (isDailyDouble) {
        setShowWager(true)
      } else {
        setShowModal(true)
      }
    }
  }

  const handleWagerSubmit = () => {
    const wagerAmount = parseInt(wager) || value
    // Max wager is the higher of: current score or the max value for the round
    const maxWager = Math.max(score, value)
    // Ensure wager is between $5 and maxWager
    const finalWager = Math.max(5, Math.min(wagerAmount, maxWager))
    setWager(finalWager.toString())
    setShowWager(false)
    setShowModal(true)
  }

  // Helper function to normalize answers for comparison
  const normalizeAnswer = (answer) => {
    if (!answer) return ''
    
    // Convert to lowercase and remove punctuation
    let normalized = answer.trim().toLowerCase().replace(/[^\w\s]/g, '')
    
    // Remove question prefixes (what is, what are, who is, who are, etc.)
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

  // Helper function to compare answers, handling pluralization
  const compareAnswers = (userAns, correctAns) => {
    const userNorm = normalizeAnswer(userAns)
    const correctNorm = normalizeAnswer(correctAns)
    
    // Exact match
    if (userNorm === correctNorm) return true
    
    // Check if one contains the other
    if (userNorm.includes(correctNorm) || correctNorm.includes(userNorm)) return true
    
    // Handle pluralization - remove trailing 's' and compare
    const userSingular = userNorm.replace(/s$/, '')
    const correctSingular = correctNorm.replace(/s$/, '')
    
    if (userSingular === correctNorm || userNorm === correctSingular) return true
    if (userSingular === correctSingular && userSingular.length > 0) return true
    
    // Check if singular forms match when one has 's' and other doesn't
    if (userNorm.endsWith('s') && userNorm.slice(0, -1) === correctNorm) return true
    if (correctNorm.endsWith('s') && correctNorm.slice(0, -1) === userNorm) return true
    
    return false
  }

  const handleSubmit = () => {
    const correct = compareAnswers(userAnswer, clue.answer)
    
    setIsCorrect(correct)
    setShowResult(true)
    
    if (correct) {
      setScore(score + finalValue)
    } else {
      setScore(score - finalValue)
    }
  }

  const handlePass = () => {
    setIsCorrect(false)
    setShowResult(true)
  }

  const closeModal = () => {
    setAnswered(true)
    setShowModal(false)
    setShowWager(false)
    setShowResult(false)
    setUserAnswer('')
    setWager('')
  }

  if (answered) {
    return (
      <div className="bg-black h-28 flex items-center justify-center border-2 border-black">
      </div>
    )
  }

  return (
    <>
      <motion.div
        onClick={handleClick}
        className="h-28 flex items-center justify-center font-bold text-4xl cursor-pointer border-2 relative group"
        style={{
          background: 'var(--jeopardy-gradient)',
          borderColor: '#000'
        }}
      >
        <div
          className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-150"
          style={{ pointerEvents: 'none' }}
        />
        <span className="money-value relative z-10">${value}</span>
      </motion.div>

      <AnimatePresence>
        {showWager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{
              background: 'linear-gradient(135deg, #0A0F99 0%, #071277 50%, #0A0F99 100%)',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="h-full w-full flex items-center justify-center px-8"
            >
              <div className="max-w-2xl w-full">
                <div className="bg-yellow-500 border-8 border-yellow-300 p-12 rounded-3xl text-center shadow-2xl">
                  <div className="text-white text-6xl font-black mb-8" style={{ fontFamily: 'Georgia, serif', textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
                    DAILY DOUBLE
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
                      placeholder={`Max: $${Math.max(score, value)}`}
                      min="5"
                      max={Math.max(score, value)}
                      autoFocus
                    />
                    <div className="text-white text-xl mt-4">
                      Maximum wager: ${Math.max(score, value)}
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
              </div>
            </motion.div>
          </motion.div>
        )}
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{
              background: 'linear-gradient(135deg, #0A0F99 0%, #071277 50%, #0A0F99 100%)',
            }}
          >
            {!showResult ? (
              /* Question Display Screen */
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full w-full flex flex-col items-center justify-center px-8"
              >
                {/* The Jeopardy Question - Full Screen Centered */}
                <div 
                  className="text-white text-center max-w-6xl"
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
                    {clue.question}
                  </motion.div>
                </div>

                {/* Answer Input Section - Appears Below Question */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="mt-16 w-full max-w-3xl"
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
                      <button
                        className="px-10 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600 font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        onClick={handlePass}
                      >
                        PASS
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              /* Result Display Screen */
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="h-full w-full flex items-center justify-center px-8"
              >
                <div className="max-w-4xl w-full">
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
                        <div className="text-white text-3xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                          You earned ${finalValue}!
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-7xl mb-6">❌</div>
                        <div className="text-white text-5xl font-black mb-4" style={{ fontFamily: 'Georgia, serif', textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
                          {userAnswer ? 'INCORRECT!' : 'PASSED'}
                        </div>
                        <div className="bg-black bg-opacity-40 p-6 rounded-xl mt-6 mb-6">
                          <div className="text-yellow-300 text-2xl font-bold mb-2">CORRECT ANSWER:</div>
                          <div className="text-white text-4xl font-bold uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                            {clue.answer}
                          </div>
                        </div>
                        {userAnswer && (
                          <div className="text-white text-3xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                            You lost ${finalValue}!
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex justify-center mt-12">
                    <button
                      className="px-16 py-5 bg-white text-blue-900 rounded-2xl hover:bg-yellow-300 font-black text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all"
                      onClick={closeModal}
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      CONTINUE
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
