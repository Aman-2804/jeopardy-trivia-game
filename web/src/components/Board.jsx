import React, { useState } from 'react'
import Tile from './Tile'

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
            className="p-4 h-32 flex items-center justify-center font-black text-center text-white uppercase"
            style={{ background: 'var(--jeopardy-blue)' }}
          >
            <span className="text-xl leading-tight font-extrabold">{cat.title}</span>
          </div>
        ))}
      </div>

      {/* Clue Grid */}
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 5 }).map((_, row) =>
          categories.map((cat, col) => (
            <Tile
              key={`${row}-${col}`}
              value={values[row]}
              clue={cat.clues[row]}
              score={score}
              setScore={setScore}
            />
          ))
        )}
      </div>
    </div>
  )
}
