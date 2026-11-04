import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function HomePlaceholder() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-textMain">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-sm p-6 text-center border border-pink-100">
        <div className="w-16 h-16 bg-primary-soft text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🌸
        </div>
        <h1 className="text-2xl font-semibold text-primary font-heading mb-2">
          Period Tracker
        </h1>
        <p className="text-textMuted text-sm mb-4">
          Personalized cycle predictions & nutrition guide
        </p>
        <div className="inline-block bg-primary-soft text-primary text-xs px-3 py-1.5 rounded-full font-medium">
          Task 1.1 Complete • Setup Ready
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
      </Routes>
    </BrowserRouter>
  )
}
