"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function BackButton() {
  const router = useRouter()

  return (
    <button onClick={() => router.back()} className="mr-2 hover:bg-muted p-2 rounded-full transition-colors">
      <ArrowLeft className="w-6 h-6" />
      <span className="sr-only">Go back</span>
    </button>
  )
}
