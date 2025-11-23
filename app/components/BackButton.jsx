"use client"

import { ArrowLeft } from "lucide-react"

export function BackButton() {
  return (
    <button 
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.history.back()
        }
      }} 
      className="mr-2 hover:bg-muted p-2 rounded-full transition-colors"
    >
      <ArrowLeft className="w-6 h-6" />
      <span className="sr-only">Go back</span>
    </button>
  )
}

