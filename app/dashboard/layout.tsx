"use client"

import type { ReactNode } from "react"
import AuthGuard from "@/components/auth-guard"
import { StatsProvider } from "@/contexts/stats-context"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard requireAuth={true}>
      <StatsProvider>{children}</StatsProvider>
    </AuthGuard>
  )
}
