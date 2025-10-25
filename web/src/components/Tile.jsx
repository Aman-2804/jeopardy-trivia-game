import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Tile({ value, clue, score, setScore }) {
  const [answered, setAnswered] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleClick = () => {
    if (!answered) {
      setShowModal(true)
    }
  }

  const handleSubmit = () => {
    // Simple check - normalize and compare
    const userNorm = userAnswer.trim().toLowerCase().replace(/[^\w\s]/g, '')
    const correctNorm = clue.answer.toLowerCase().replace(/[^\w\s]/g, '')
    const correct = userNorm.includes(correctNorm) || correctNorm.includes(userNorm)
    
    setIsCorrect(correct)
    setShowResult(true)
    
    if (correct) {
      setScore(score + value)
    } else {
      setScore(score - value)
    }
  }

  const handlePass = () => {
    setIsCorrect(false)
    setShowResult(true)
  }

  const closeModal = () => {
    setAnswered(true)
    setShowModal(false)
    setShowResult(false)
    setUserAnswer('')
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
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={handleClick}
        className="h-28 flex items-center justify-center font-bold text-4xl cursor-pointer border-2"
        style={{
          background: 'var(--jeopardy-gradient)',
          borderColor: '#000'
        }}
      >
        <span className="money-value">${value}</span>
      </motion.div>

      <AnimatePresence>
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
            {/* Jeopardy watermark */}
            <div className="absolute top-8 right-8 text-gray-400 text-2xl font-black opacity-40 tracking-wider">
              #JEOPARDY!
            </div>

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
                    className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-wide uppercase"
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
                      placeholder="Type your answer..."
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
                          You earned ${value}!
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
                            You lost ${value}!
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
