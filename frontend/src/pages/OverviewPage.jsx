import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  CircleDot,
  FolderKanban,
  Users
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

import {
  ActionLink,
  Avatar,
  Badge,
  Card,
  LoadingState,
  ProgressBar,
  SectionTitle,
  StatCard
} from "../components/ui.jsx";
import { dashboardApi } from "../lib/api.js";
import { formatDate, relativeToReference, statusLabel } from "../lib/utils.js";

const pieColors = ["#ff5c5c", "#f7a328", "#22c55e"];

export default function OverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.overview
  });

  const priorityChart = useMemo(() => {
    if (!data) return [];
    return [
      { name: "High", value: data.priorityBreakdown.high },
      { name: "Medium", value: data.priorityBreakdown.medium },
      { name: "Low", value: data.priorityBreakdown.low }
    ];
  }, [data]);

  const taskOverview = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Completed", value: data.taskSummary.completed, color: "#22c55e" },
      { name: "In Progress", value: data.taskSummary.inProgress, color: "#3b82f6" },
      { name: "To Do", value: data.taskSummary.todo, color: "#94a3b8" },
      { name: "Blocked", value: data.taskSummary.blocked, color: "#ef4444" }
    ];
  }, [data]);

  if (isLoading) {
    return <LoadingState label="Loading overview..." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title={data.greeting}
        subtitle="Here’s what’s happening with your projects today."
        action={
          <div className="rounded-2xl border border-brand-100 bg-white px-5 py-3 text-sm font-semibold text-ink">
            {formatDate(data.dateRange.start)} - {formatDate(data.dateRange.end)}
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Tasks"
          value={data.stats.totalTasks}
          note="+ 12% from last week"
          icon={FolderKanban}
        />
        <StatCard
          title="In Progress"
          value={data.stats.inProgress}
          note="+ 8% from last week"
          icon={CircleDot}
          iconClassName="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Completed"
          value={data.stats.completed}
          note="+ 16% from last week"
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Due Today"
          value={data.stats.dueToday}
          note="- 2 from yesterday"
          icon={CalendarClock}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Team Members"
          value={data.stats.teamMembers}
          note="Active this week"
          icon={Users}
          iconClassName="bg-pink-50 text-pink-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-2xl font-bold text-ink">Project Progress</div>
            <div className="rounded-2xl border border-brand-100 px-4 py-2 text-sm font-semibold text-soft">
              This Week
            </div>
          </div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.weeklyLabels.map((label, index) => ({
                  label,
                  ...Object.fromEntries(
                    data.weeklyProgress.map((series) => [series.name, series.points[index]])
                  )
                }))}
              >
                <CartesianGrid stroke="#f2edff" vertical={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="Aurora Website Redesign"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Mobile App Development"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Marketing Campaign Q3"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {data.progressByProject.map((project) => (
              <div key={project.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{project.name}</span>
                  <span className="font-semibold text-ink">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} color={project.color} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-2xl font-bold text-ink">Tasks by Priority</div>
          <div className="mt-6 grid items-center gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChart}
                    dataKey="value"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={2}
                  >
                    {priorityChart.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-5">
              {priorityChart.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: pieColors[index] }}
                    />
                    <span className="text-sm font-medium text-ink">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-ink">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1.2fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-ink">Team Activity</div>
            <ActionLink>View All</ActionLink>
          </div>
          <div className="mt-6 space-y-5">
            {data.teamActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar user={activity.user} size="sm" />
                <div className="min-w-0">
                  <div className="font-semibold text-ink">{activity.user?.name}</div>
                  <div className="text-sm text-soft">{activity.text}</div>
                </div>
                <div className="ml-auto text-xs text-soft">
                  {relativeToReference(activity.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-ink">Tasks Overview</div>
            <div className="rounded-2xl border border-brand-100 px-4 py-2 text-sm font-semibold text-soft">
              This Week
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskOverview}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {taskOverview.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="text-5xl font-extrabold text-ink">{data.completionRate}%</div>
                  <div className="mt-2 text-sm text-soft">Tasks Completed</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {taskOverview.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-ink">{item.name}</span>
                  </div>
                  <span className="text-lg font-semibold text-ink">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-ink">Upcoming Tasks</div>
            <ActionLink>View All</ActionLink>
          </div>
          <div className="mt-6 space-y-5">
            {data.upcomingTasks.map((task) => (
              <div key={task.id} className="rounded-[22px] border border-brand-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-ink">{task.title}</div>
                    <div className="mt-1 text-sm text-soft">{task.project}</div>
                  </div>
                  <Badge tone={task.priority}>{statusLabel(task.priority)}</Badge>
                </div>
                <div className="mt-4 text-sm text-soft">{formatDate(task.dueDate)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
