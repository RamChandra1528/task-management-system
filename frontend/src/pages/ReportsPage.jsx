import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { CheckCircle2, FolderKanban, TimerReset, TriangleAlert } from "lucide-react";

import {
  ActionLink,
  Avatar,
  Card,
  LoadingState,
  ProgressBar,
  SectionTitle,
  StatCard
} from "../components/ui.jsx";
import { reportApi } from "../lib/api.js";
import { formatDate, relativeToReference } from "../lib/utils.js";

const statusChartColors = {
  completed: "#22c55e",
  inProgress: "#3b82f6",
  pending: "#f59e0b",
  overdue: "#ef4444",
  onHold: "#94a3b8"
};

const priorityColors = ["#ff5c5c", "#f7a328", "#4ade80", "#94a3b8"];

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: reportApi.summary
  });

  const statusBreakdown = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.taskOverview.buckets).map(([key, value]) => ({
      key,
      value,
      label:
        key === "inProgress"
          ? "In Progress"
          : key === "onHold"
            ? "On Hold"
            : key.charAt(0).toUpperCase() + key.slice(1),
      color: statusChartColors[key]
    }));
  }, [data]);

  const priorityData = useMemo(() => {
    if (!data) return [];
    return [
      { label: "High", value: data.priorityBreakdown.high },
      { label: "Medium", value: data.priorityBreakdown.medium },
      { label: "Low", value: data.priorityBreakdown.low },
      { label: "None", value: data.priorityBreakdown.none }
    ];
  }, [data]);

  if (isLoading) {
    return <LoadingState label="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Reports"
        subtitle="Track performance and analyze productivity"
        action={
          <div className="rounded-2xl border border-brand-100 bg-white px-5 py-3 text-sm font-semibold text-ink">
            {formatDate(data.period.start)} - {formatDate(data.period.end)}
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={data.cards.totalProjects}
          note="+ 20% vs Apr"
          icon={FolderKanban}
        />
        <StatCard
          title="Completed Tasks"
          value={data.cards.completedTasks}
          note="+ 16% vs Apr"
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="In Progress Tasks"
          value={data.cards.inProgressTasks}
          note="- 8% vs Apr"
          icon={TimerReset}
          iconClassName="bg-blue-50 text-blue-500"
        />
        <StatCard
          title="Overdue Tasks"
          value={data.cards.overdueTasks}
          note="- 5% vs Apr"
          icon={TriangleAlert}
          iconClassName="bg-rose-50 text-rose-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-bold text-ink">Tasks Overview</div>
                <div className="rounded-2xl border border-brand-100 px-4 py-2 text-sm font-semibold text-soft">
                  Group by Status
                </div>
              </div>
              <div className="mt-6 grid items-center gap-6 md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        dataKey="value"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {statusBreakdown.map((item) => (
                          <Cell key={item.key} fill={item.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                    <div>
                      <div className="text-5xl font-extrabold text-ink">
                        {data.taskOverview.total}
                      </div>
                      <div className="mt-2 text-sm text-soft">Total Tasks</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {statusBreakdown.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-ink">{item.label}</span>
                      </div>
                      <span className="font-semibold text-ink">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-bold text-ink">Task Completion Trend</div>
                <div className="rounded-2xl border border-brand-100 px-4 py-2 text-sm font-semibold text-soft">
                  Daily
                </div>
              </div>
              <div className="mt-6 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.completionTrend}>
                    <CartesianGrid stroke="#f2edff" vertical={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#7c3aed"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-ink">Projects Progress</div>
                <ActionLink>View all</ActionLink>
              </div>
              <div className="mt-6 space-y-5">
                {data.projectsProgress.map((project) => (
                  <div key={project.id}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-ink">{project.name}</span>
                      <span className="font-semibold text-ink">{project.progress}%</span>
                    </div>
                    <ProgressBar value={project.progress} color={project.color} />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-2xl font-bold text-ink">Tasks by Priority</div>
              <div className="mt-6 grid items-center gap-6 md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        dataKey="value"
                        innerRadius={62}
                        outerRadius={92}
                        paddingAngle={2}
                      >
                        {priorityData.map((item, index) => (
                          <Cell key={item.label} fill={priorityColors[index]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                    <div>
                      <div className="text-5xl font-extrabold text-ink">
                        {data.taskOverview.total}
                      </div>
                      <div className="mt-2 text-sm text-soft">Total</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  {priorityData.map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: priorityColors[index] }}
                        />
                        <span className="text-sm text-ink">{item.label}</span>
                      </div>
                      <span className="font-semibold text-ink">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-ink">Project Summary</div>
              <ActionLink>View all</ActionLink>
            </div>
            <div className="mt-6 space-y-5">
              {[
                ["Total Projects", data.projectSummary.totalProjects, "#7c3aed"],
                ["Active Projects", data.projectSummary.activeProjects, "#22c55e"],
                ["Completed Projects", data.projectSummary.completedProjects, "#16a34a"],
                ["On Hold Projects", data.projectSummary.onHoldProjects, "#f59e0b"],
                ["Cancelled Projects", data.projectSummary.cancelledProjects, "#ef4444"]
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm text-ink">{label}</span>
                  </div>
                  <span className="font-semibold text-ink">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-ink">Team Workload</div>
              <ActionLink>View all</ActionLink>
            </div>
            <div className="mt-6 space-y-5">
              {data.teamWorkload.map((member) => (
                <div key={member.id} className="flex items-center gap-4">
                  <Avatar user={member} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink">{member.name}</div>
                    <div className="mt-2">
                      <ProgressBar value={member.load} />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-ink">{member.load}%</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-ink">Recent Activity</div>
              <ActionLink>View all</ActionLink>
            </div>
            <div className="mt-6 space-y-5">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar user={activity.user} size="sm" />
                  <div className="min-w-0">
                    <div className="font-semibold text-ink">{activity.user?.name}</div>
                    <div className="text-sm text-soft">{activity.note}</div>
                  </div>
                  <div className="ml-auto text-xs text-soft">
                    {relativeToReference(activity.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
