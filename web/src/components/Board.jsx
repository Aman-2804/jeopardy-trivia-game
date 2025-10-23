import React, { useState } from 'react'
import Tile from './Tile'

export default function Board({ data, round, score, setScore }) {
  const categories = data.categories.slice(0, 6)
  const values = round === 'jeopardy' ? [200, 400, 600, 800, 1000] : [400, 800, 1200, 1600, 2000]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Category Headers */}
      <div className="grid grid-cols-6 gap-[2px] mb-[2px]">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="h-28 flex items-center justify-center text-center border-2 border-black"
            style={{
              background: '#071DE2',
              color: '#FFCC00',
              fontFamily: 'Georgia, "ITC Korinna", "Times New Roman", serif',
              textShadow: '0 2px 4px #010A8C',
              boxShadow: 'inset 0 0 8px rgba(0, 49, 255, 0.4)',
            }}
          >
            <span 
              className="text-base font-bold uppercase leading-tight px-2"
              style={{ 
                letterSpacing: '0.05em',
                fontVariant: 'small-caps'
              }}
            >
              {cat.title}
            </span>
          </div>
        ))}
      </div>

      {/* Clue Grid */}
      <div className="grid grid-cols-6 gap-[2px]">
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
