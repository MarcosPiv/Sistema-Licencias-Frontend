import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-10 w-64" />
      </div>

      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  )
}
