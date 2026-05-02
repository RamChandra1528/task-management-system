import { useMemo, useState } from "react";
import { CalendarDays, PencilLine, Trash2 } from "lucide-react";

import {
  Avatar,
  Badge,
  Field,
  Input,
  Modal,
  PrimaryButton,
  Select,
  TextArea
} from "./ui.jsx";
import { formatDate, statusLabel } from "../lib/utils.js";

export default function TaskDetailModal({
  open,
  onClose,
  task,
  users = [],
  onUpdate,
  onComment,
  onDelete,
  busy = false
}) {
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const progressCount = useMemo(() => {
    const total = task?.checklist?.length || 0;
    const completed = task?.checklist?.filter((item) => item.completed).length || 0;
    return { total, completed };
  }, [task]);

  if (!task) {
    return null;
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    await onComment(task._id, { text: comment });
    setComment("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task.title}
      subtitle={task.project?.name}
      size="lg"
    >
      <div className="space-y-6">
        {/* Status & Priority Row */}
        <div className="grid gap-4 md:grid-cols-2">
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
        </div>

        {/* Assignee & Sprint */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Assignee">
            <Select
              value={task.assignee?._id || task.assignee || ""}
              onChange={(event) => onUpdate(task._id, { assignee: event.target.value })}
              disabled={busy}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sprint">
            <Input
              value={task.sprint || ""}
              onChange={(event) => onUpdate(task._id, { sprint: event.target.value })}
              disabled={busy}
            />
          </Field>
        </div>

        {/* Due Date & Estimated Time */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Due Date">
            <Input
              type="date"
              value={task.dueDate?.split("T")[0] || ""}
              onChange={(event) => onUpdate(task._id, { dueDate: event.target.value })}
              disabled={busy}
            />
          </Field>
          <Field label="Estimated Hours">
            <Input
              type="number"
              min="0"
              value={task.estimatedHours || 0}
              onChange={(event) =>
                onUpdate(task._id, { estimatedHours: Number(event.target.value) })
              }
              disabled={busy}
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description">
          <TextArea
            rows={4}
            value={task.description || ""}
            onChange={(event) => onUpdate(task._id, { description: event.target.value })}
            disabled={busy}
            placeholder="Add task description..."
          />
        </Field>

        {/* Tags */}
        {task.tags && task.tags.length > 0 ? (
          <Field label="Tags">
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </Field>
        ) : null}

        {/* Checklist */}
        {task.checklist && task.checklist.length > 0 ? (
          <div className="border-t border-brand-100 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wide text-ink">Checklist</h4>
              <div className="text-sm font-semibold text-soft">
                {progressCount.completed} / {progressCount.total}
              </div>
            </div>
            <div className="space-y-3">
              {task.checklist.map((item, index) => (
                <label
                  key={item._id || `${item.text}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3 cursor-pointer hover:bg-brand-50/30 transition"
                >
                  <input
                    type="checkbox"
                    checked={item.completed || false}
                    onChange={() => {
                      const nextChecklist = task.checklist.map((entry) =>
                        entry._id === item._id
                          ? { ...entry, completed: !entry.completed }
                          : entry
                      );
                      onUpdate(task._id, { checklist: nextChecklist });
                    }}
                    className="cursor-pointer"
                  />
                  <span className={item.completed ? "text-soft line-through" : "text-ink"}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {/* Comments Section */}
        <div className="border-t border-brand-100 pt-6">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink">Comments</h4>
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <TextArea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a comment..."
              rows={3}
              disabled={busy}
            />
            <PrimaryButton
              type="submit"
              disabled={!comment.trim() || busy}
              className="w-full"
            >
              Post Comment
            </PrimaryButton>
          </form>

          {task.comments && task.comments.length > 0 ? (
            <div className="mt-6 space-y-4">
              {task.comments.map((c, index) => (
                <div key={c._id || index} className="rounded-2xl border border-brand-100 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar user={c.author} size="sm" />
                    <div className="flex-1">
                      <div className="font-semibold text-ink">{c.author?.name}</div>
                      <div className="text-xs text-soft">{formatDate(c.createdAt)}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-ink">{c.text}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-brand-100 pt-6 flex gap-3">
          <PrimaryButton
            onClick={() => setIsEditing(!isEditing)}
            className="flex-1"
          >
            <PencilLine className="h-4 w-4" />
            {isEditing ? "Done" : "Edit"}
          </PrimaryButton>
          {onDelete ? (
            <button
              onClick={() => {
                onDelete(task._id);
                onClose();
              }}
              disabled={busy}
              className="rounded-2xl border border-rose-200 px-5 py-3 font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
