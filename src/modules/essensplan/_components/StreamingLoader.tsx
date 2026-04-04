interface StreamingLoaderProps {
  message: string;
  planType: "meal" | "training" | "both";
}

export default function StreamingLoader({ message, planType }: StreamingLoaderProps) {
  const skeletonDays = planType === "both" ? 4 : 3;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress message */}
      <div className="text-center py-6">
        <span className="loading loading-dots loading-lg text-primary" />
        <p className="mt-4 text-lg font-semibold animate-pulse">{message}</p>
        <p className="text-sm opacity-60 mt-1">Das kann bis zu 15 Sekunden dauern</p>
      </div>

      {/* Skeleton cards */}
      <div className="space-y-4">
        {Array.from({ length: skeletonDays }).map((_, i) => (
          <div key={i} className="card bg-base-100 shadow-sm border border-base-300 animate-pulse">
            <div className="card-body py-4 px-5">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-base-300 rounded" />
                <div className="h-4 w-32 bg-base-300 rounded" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full bg-base-200 rounded" />
                <div className="h-4 w-3/4 bg-base-200 rounded" />
                <div className="h-4 w-1/2 bg-base-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
