import { Loader2, Clock } from "lucide-react"

export default function SessionExpiredLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="text-center space-y-6">
        <div className="mx-auto p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full w-fit">
          <Clock className="h-12 w-12 text-amber-600 dark:text-amber-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Verificando sesión...</h2>
          <p className="text-slate-600 dark:text-slate-400">Preparando formulario de autenticación</p>
        </div>
      </div>
    </div>
  )
}
