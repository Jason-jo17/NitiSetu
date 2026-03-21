import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { CompliancePanel } from "@/components/dashboard/CompliancePanel";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-full">
      <DashboardHeader />
      <div className="flex-1 p-6 space-y-6">
        <StatsGrid />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <RecentJobs />
          </div>
          <CompliancePanel />
        </div>
      </div>
    </div>
  );
}
