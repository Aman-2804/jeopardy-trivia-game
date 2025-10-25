import React, { useState } from 'react'
import Tile from './Tile'
import CategoryTitle from './CategoryTitle'

export default function Board({ data, round, score, setScore }) {
  const categories = data.categories.slice(0, 6)
  const values = round === 'jeopardy' ? [200, 400, 600, 800, 1000] : [400, 800, 1200, 1600, 2000]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Category Headers */}
      <div className="grid grid-cols-6 gap-2 mb-2">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="p-2 h-36 flex items-center justify-center text-center"
            style={{
              background: 'var(--jeopardy-gradient)',
              textShadow: '0 4px 10px rgba(0,0,0,0.7), 0 0 20px rgba(255,255,255,0.05)'
            }}
          >
            <CategoryTitle>
              {cat.title}
            </CategoryTitle>
          </div>
        ))}
      </div>

      {/* Clue Grid */}
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 5 }).map((_, row) =>
          categories.map((cat, col) => (
            <div key={`${row}-${col}`} className="">
              <Tile
                value={values[row]}
                clue={cat.clues[row]}
                score={score}
                setScore={setScore}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
