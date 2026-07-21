import { Skeleton } from "@/design-system/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-6 w-56" />
      </div>
      <div className="flex flex-col gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="ms-auto h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
