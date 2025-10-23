import React from 'react'

export default function Score({ score }) {
  return (
    <div 
      className="px-6 py-2 font-bold text-2xl border-2"
      style={{
        background: '#000000',
        color: '#FFCC00',
        borderColor: '#060CE9',
        fontFamily: 'Georgia, "ITC Korinna", "Times New Roman", serif',
        textShadow: '0 2px 4px #010A8C',
      }}
    >
      ${score.toLocaleString()}
    </div>
  )
}
