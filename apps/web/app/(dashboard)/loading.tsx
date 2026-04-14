export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-48 bg-slate-800 rounded opacity-50" />
        <div className="h-4 w-96 bg-slate-900 rounded opacity-30" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-3 gap-6">
        <div className="h-[200px] bg-slate-900/50 rounded-xl border border-white/5" />
        <div className="col-span-2 h-[500px] bg-slate-900/50 rounded-xl border border-white/5" />
      </div>

      {/* Secondary Row Skeleton */}
      <div className="grid grid-cols-4 gap-6">
        <div className="h-32 bg-slate-900/40 rounded-xl" />
        <div className="h-32 bg-slate-900/40 rounded-xl" />
        <div className="h-32 bg-slate-900/40 rounded-xl" />
        <div className="h-32 bg-slate-900/40 rounded-xl" />
      </div>
    </div>
  );
}
