import React from 'react'

export default function Score({ score }) {
  return (
    <div className="bg-black border border-gray-700 px-4 py-2 text-yellow-400 font-bold text-xl">
      Score: ${score}
    </div>
  )
}
