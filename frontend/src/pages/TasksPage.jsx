import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, LayoutGrid, List, MoreVertical, Plus } from "lucide-react";

import CreateTaskModal from "../components/CreateTaskModal.jsx";
import TaskDetailModal from "../components/TaskDetailModal.jsx";
import {
  Avatar,
  Badge,
  LoadingState,
  PrimaryButton,
  SearchField,
  SectionTitle,
  SecondaryButton
} from "../components/ui.jsx";
import { projectApi, taskApi, userApi } from "../lib/api.js";
import { formatDate, statusLabel } from "../lib/utils.js";

const statusTabs = [
  { value: "all", label: "All" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" }
];

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskApi.list
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.list
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.list
  });

  const createMutation = useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setCreating(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => taskApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });

  const deleteMutation = useMutation({
    mutationFn: taskApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setSelectedId("");
    }
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, payload }) => taskApi.comment(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const haystack = `${task.title} ${task.description} ${task.project?.name} ${task.assignee?.name}`;
      const matchesSearch = !search || haystack.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, tasks]);

  const selectedTask = tasks.find((task) => task._id === selectedId) || null;

  if (isLoading) {
    return <LoadingState label="Loading tasks..." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Tasks" 
        subtitle="Manage and track all your tasks in one place"
        action={
          <PrimaryButton onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            New Task
          </PrimaryButton>
        }
      />

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                statusFilter === tab.value
                  ? "border-brand-200 bg-brand-50 text-brand-600"
                  : "border-brand-100 bg-white text-soft"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-soft">
                {tab.value === "all"
                  ? tasks.length
                  : tasks.filter((task) => task.status === tab.value).length}
              </span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <SecondaryButton>
              <Filter className="h-4 w-4" />
              Filter
            </SecondaryButton>
            <SecondaryButton>
              <span className="text-sm">Sort: Due Soon</span>
            </SecondaryButton>
            <SecondaryButton>
              <List className="h-4 w-4" />
            </SecondaryButton>
            <SecondaryButton>
              <LayoutGrid className="h-4 w-4" />
            </SecondaryButton>
          </div>
        </div>

        <SearchField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tasks, projects, assignees..."
        />

        <div className="overflow-hidden rounded-[28px] border border-brand-100 bg-white shadow-card">
          <div className="hidden grid-cols-[36px_1.6fr_1.2fr_1.1fr_0.9fr_0.9fr_0.9fr_40px] gap-4 border-b border-brand-100 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 lg:grid">
            <span />
            <span>Task</span>
            <span>Project</span>
            <span>Assignee</span>
            <span>Priority</span>
            <span>Status</span>
            <span>Due Date</span>
            <span />
          </div>

          <div className="divide-y divide-brand-100">
            {visibleTasks.slice(0, 10).map((task) => (
              <button
                key={task._id}
                onClick={() => setSelectedId(task._id)}
                className={`grid w-full gap-4 px-5 py-4 text-left transition lg:grid-cols-[36px_1.6fr_1.2fr_1.1fr_0.9fr_0.9fr_0.9fr_40px] bg-white hover:bg-brand-50/40`}
              >
                <div className="hidden items-center justify-center lg:flex">
                  <input type="checkbox" readOnly checked={false} />
                </div>
                <div>
                  <div className="font-semibold text-ink">{task.title}</div>
                  <div className="mt-1 text-xs text-soft">{task.comments?.length || 0} comments</div>
                </div>
                <div className="text-sm text-soft">{task.project?.name}</div>
                <div className="flex items-center gap-3">
                  <Avatar user={task.assignee} size="sm" />
                  <div className="text-sm font-medium text-ink">{task.assignee?.name}</div>
                </div>
                <div>
                  <Badge tone={task.priority}>{statusLabel(task.priority)}</Badge>
                </div>
                <div>
                  <Badge tone={task.status}>{statusLabel(task.status)}</Badge>
                </div>
                <div className="text-sm text-soft">{formatDate(task.dueDate)}</div>
                <div className="hidden items-center justify-center lg:flex">
                  <MoreVertical className="h-4 w-4 text-soft" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-3 text-sm text-soft">
          <span>
            Showing 1 to {Math.min(visibleTasks.length, 10)} of {visibleTasks.length} tasks
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`h-10 w-10 rounded-2xl border ${
                  page === 1
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-brand-100 bg-white"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
        loading={createMutation.isPending}
        projects={projects}
        users={users}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        open={!!selectedId}
        onClose={() => setSelectedId("")}
        task={selectedTask}
        users={users}
        busy={updateMutation.isPending || commentMutation.isPending || deleteMutation.isPending}
        onUpdate={(id, payload) => updateMutation.mutate({ id, payload })}
        onComment={(id, payload) => commentMutation.mutateAsync({ id, payload })}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}
