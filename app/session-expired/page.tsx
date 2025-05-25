"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import SessionExpiredForm from "@/components/session-expired-form"

function SessionExpiredContent() {
  const searchParams = useSearchParams()
  const lastEmail = searchParams.get("email") || ""

  return <SessionExpiredForm lastEmail={lastEmail} />
}

export default function SessionExpiredPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SessionExpiredContent />
    </Suspense>
  )
}