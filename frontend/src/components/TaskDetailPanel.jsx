import { useMemo, useState } from "react";
import { CalendarDays, Paperclip, PencilLine, Trash2 } from "lucide-react";

import {
  Avatar,
  Badge,
  Card,
  Field,
  Input,
  LoadingState,
  PrimaryButton,
  Select,
  TextArea
} from "./ui.jsx";
import { formatDate, relativeToReference, statusLabel } from "../lib/utils.js";

export default function TaskDetailPanel({
  task,
  users = [],
  onUpdate,
  onComment,
  onDelete,
  busy
}) {
  const [comment, setComment] = useState("");

  const progressCount = useMemo(() => {
    const total = task?.checklist?.length || 0;
    const completed = task?.checklist?.filter((item) => item.completed).length || 0;
    return { total, completed };
  }, [task]);

  if (!task) {
    return <LoadingState label="Select a task to inspect details." />;
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    await onComment(task._id, { text: comment });
    setComment("");
  }

  return (
    <Card className="sticky top-28 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-brand-500" />
            <h3 className="text-2xl font-bold text-ink">{task.title}</h3>
          </div>
          <p className="mt-2 text-soft">{task.project?.name}</p>
        </div>
        <div className="flex items-center gap-2 text-soft">
          <button className="rounded-2xl border border-brand-100 p-3">
            <PencilLine className="h-4 w-4" />
          </button>
          {onDelete ? (
            <button
              onClick={() => onDelete(task._id)}
              className="rounded-2xl border border-rose-100 p-3 text-rose-500"
              disabled={busy}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <Field label="Status">
          <Select
            value={task.status}
            onChange={(event) => onUpdate(task._id, { status: event.target.value })}
            disabled={busy}
          >
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </Select>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Priority">
            <Select
              value={task.priority}
              onChange={(event) => onUpdate(task._id, { priority: event.target.value })}
              disabled={busy}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Field>
          <Field label="Assignee">
            <Select
              value={task.assignee?._id || task.assignee}
              onChange={(event) => onUpdate(task._id, { assignee: event.target.value })}
              disabled={busy}
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Sprint">
            <Input
              value={task.sprint || ""}
              onChange={(event) => onUpdate(task._id, { sprint: event.target.value })}
              disabled={busy}
            />
          </Field>
          <Field label="Estimated Time">
            <Input
              type="number"
              value={task.estimatedHours || 0}
              onChange={(event) =>
                onUpdate(task._id, { estimatedHours: Number(event.target.value) })
              }
              disabled={busy}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Due Date">
            <div className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-soft" />
              <span className="text-sm font-medium text-ink">
                {formatDate(task.dueDate)}
              </span>
            </div>
          </Field>
          <Field label="Tags">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-brand-100 px-4 py-3">
              {task.tags?.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Description">
          <TextArea
            rows={4}
            value={task.description || ""}
            onChange={(event) => onUpdate(task._id, { description: event.target.value })}
            disabled={busy}
          />
        </Field>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-bold text-ink">Checklist</div>
          <div className="text-sm text-soft">
            {progressCount.completed} / {progressCount.total}
          </div>
        </div>
        <div className="space-y-3">
          {task.checklist?.map((item, index) => (
            <label
              key={item._id || `${item.text}-${index}`}
              className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => {
                  const nextChecklist = task.checklist.map((entry) =>
                    entry._id === item._id
                      ? { ...entry, completed: !entry.completed }
                      : entry
                  );
                  onUpdate(task._id, { checklist: nextChecklist });
                }}
              />
              <span className={item.completed ? "text-soft line-through" : "text-ink"}>
                {item.text}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-lg font-bold text-ink">Attachments</div>
        <div className="grid gap-3 md:grid-cols-2">
          {task.attachments?.map((attachment) => (
            <div
              key={attachment._id || attachment.name}
              className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Paperclip className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">{attachment.name}</div>
                <div className="text-xs text-soft">{attachment.sizeLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-lg font-bold text-ink">Comments</div>
        <div className="space-y-4">
          {task.comments?.map((entry) => (
            <div key={entry._id} className="flex items-start gap-3">
              <Avatar user={entry.user} size="sm" />
              <div className="min-w-0 flex-1 rounded-2xl bg-brand-50/60 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-ink">{entry.user?.name}</div>
                  <div className="text-xs text-soft">
                    {relativeToReference(entry.createdAt)}
                  </div>
                </div>
                <div className="mt-2 text-sm text-soft">{entry.text}</div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleCommentSubmit} className="mt-5 space-y-3">
          <Input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Write a comment..."
          />
          <PrimaryButton type="submit" className="w-full justify-center" disabled={busy}>
            Add Comment
          </PrimaryButton>
        </form>
      </div>
    </Card>
  );
}
