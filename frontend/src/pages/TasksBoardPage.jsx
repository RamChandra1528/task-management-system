import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, MoreHorizontal } from "lucide-react";

import TaskDetailPanel from "../components/TaskDetailPanel.jsx";
import {
  Avatar,
  Badge,
  Card,
  LoadingState,
  SectionTitle,
  SecondaryButton
} from "../components/ui.jsx";
import { taskApi, userApi } from "../lib/api.js";
import { formatDate } from "../lib/utils.js";

const columns = [
  { key: "backlog", title: "Backlog", dot: "#94a3b8" },
  { key: "todo", title: "To Do", dot: "#3b82f6" },
  { key: "in_progress", title: "In Progress", dot: "#7c3aed" },
  { key: "review", title: "Review", dot: "#f59e0b" },
  { key: "done", title: "Done", dot: "#22c55e" }
];

export default function TasksBoardPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState("");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskApi.list
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.list
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

  const grouped = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        items: tasks.filter((task) => task.status === column.key)
      })),
    [tasks]
  );

  const selectedTask =
    tasks.find((task) => task._id === selectedId) || tasks[0] || null;

  if (isLoading) {
    return <LoadingState label="Loading board..." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Board / Kanban" subtitle="Track and manage tasks across all projects" />

      <div className="grid gap-6 xl:grid-cols-[1.8fr_0.9fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap justify-end gap-3">
            <SecondaryButton>
              <Filter className="h-4 w-4" />
              Filter
            </SecondaryButton>
            <SecondaryButton>Group by: Status</SecondaryButton>
            <SecondaryButton>
              <MoreHorizontal className="h-4 w-4" />
            </SecondaryButton>
          </div>

          <div className="grid gap-5 xl:grid-cols-5">
            {grouped.map((column) => (
              <Card
                key={column.key}
                className="flex min-h-[720px] flex-col gap-4 p-4"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const taskId = event.dataTransfer.getData("text/plain");
                  if (taskId) {
                    updateMutation.mutate({
                      id: taskId,
                      payload: { status: column.key }
                    });
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: column.dot }}
                    />
                    <div className="font-bold text-ink">{column.title}</div>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-soft" />
                </div>

                <div className="space-y-4">
                  {column.items.map((task) => (
                    <button
                      key={task._id}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("text/plain", task._id)}
                      onClick={() => setSelectedId(task._id)}
                      className={`w-full rounded-[22px] border p-4 text-left transition ${
                        selectedTask?._id === task._id
                          ? "border-brand-300 bg-brand-50/50"
                          : "border-brand-100 bg-white hover:bg-brand-50/30"
                      }`}
                    >
                      <div className="text-lg font-bold text-ink">{task.title}</div>
                      <div className="mt-2 line-clamp-3 text-sm leading-7 text-soft">
                        {task.description}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {task.tags?.slice(0, 1).map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <Avatar user={task.assignee} size="sm" />
                        <span className="text-sm text-soft">{formatDate(task.dueDate, "MMM d")}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <button className="mt-auto rounded-2xl border border-dashed border-brand-200 px-4 py-3 text-sm font-semibold text-brand-500">
                  + Add Task
                </button>
              </Card>
            ))}
          </div>
        </div>

        <TaskDetailPanel
          task={selectedTask}
          users={users}
          busy={updateMutation.isPending || commentMutation.isPending || deleteMutation.isPending}
          onUpdate={(id, payload) => updateMutation.mutate({ id, payload })}
          onComment={(id, payload) => commentMutation.mutateAsync({ id, payload })}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </div>
    </div>
  );
}
