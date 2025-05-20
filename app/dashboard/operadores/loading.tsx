import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Skeleton para la barra de navegación */}
      <div className="h-16 bg-white dark:bg-slate-800 border-b dark:border-slate-700">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Skeleton para el título */}
        <Skeleton className="h-10 w-64 mb-6" />

        {/* Skeleton para la tarjeta principal */}
        <div className="border rounded-lg overflow-hidden dark:border-slate-700">
          {/* Skeleton para las pestañas */}
          <div className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 p-4">
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>
          </div>

          {/* Skeleton para el contenido */}
          <div className="p-6">
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
