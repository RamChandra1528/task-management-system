import { useMemo } from "react";
import { PencilLine, Trash2 } from "lucide-react";

import {
  ActionLink,
  Avatar,
  AvatarGroup,
  Badge,
  Field,
  Input,
  Modal,
  PrimaryButton,
  ProgressBar,
  Select,
  TextArea
} from "./ui.jsx";
import { formatDate, statusLabel } from "../lib/utils.js";

export default function ProjectDetailModal({
  open,
  onClose,
  project,
  tasks = [],
  onUpdate,
  onDelete,
  onEdit,
  busy = false
}) {
  const projectTasks = useMemo(
    () => tasks.filter((task) => task.project?._id === project?._id),
    [project?._id, tasks]
  );

  if (!project) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project.name}
      subtitle={project.category}
      size="lg"
    >
      <div className="space-y-6">
        {/* Status & Priority */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Status">
            <Select
              value={project.status || "active"}
              onChange={(event) => onUpdate(project._id, { status: event.target.value })}
              disabled={busy}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="at-risk">At Risk</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="Priority">
            <Select
              value={project.priority || "medium"}
              onChange={(event) => onUpdate(project._id, { priority: event.target.value })}
              disabled={busy}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Field>
        </div>

        {/* Dates */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Start Date">
            <Input
              type="date"
              value={project.startDate?.split("T")[0] || ""}
              onChange={(event) => onUpdate(project._id, { startDate: event.target.value })}
              disabled={busy}
            />
          </Field>
          <Field label="Due Date">
            <Input
              type="date"
              value={project.dueDate?.split("T")[0] || ""}
              onChange={(event) => onUpdate(project._id, { dueDate: event.target.value })}
              disabled={busy}
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description">
          <TextArea
            rows={4}
            value={project.description || ""}
            onChange={(event) => onUpdate(project._id, { description: event.target.value })}
            disabled={busy}
            placeholder="Project description..."
          />
        </Field>

        {/* Progress */}
        <Field label="Progress">
          <div className="space-y-3">
            <Input
              type="number"
              min="0"
              max="100"
              value={project.progress || 0}
              onChange={(event) =>
                onUpdate(project._id, { progress: Number(event.target.value) })
              }
              disabled={busy}
            />
            <ProgressBar
              value={project.progress || 0}
              color={project.color || "#7c3aed"}
            />
          </div>
        </Field>

        {/* Team Members */}
        {project.members && project.members.length > 0 ? (
          <div className="border-t border-brand-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wide text-ink">Team Members</h4>
              <span className="text-sm font-semibold text-soft">{project.members.length}</span>
            </div>
            <div className="space-y-3">
              {project.members.map((member) => (
                <div key={member._id} className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3">
                  <Avatar user={member} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink truncate">{member.name}</div>
                    <div className="text-xs text-soft truncate">{member.jobTitle}</div>
                  </div>
                  {member.role && (
                    <Badge tone="default">{member.role}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Recent Tasks */}
        {projectTasks.length > 0 ? (
          <div className="border-t border-brand-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wide text-ink">Recent Tasks</h4>
              <span className="text-sm font-semibold text-soft">{projectTasks.length}</span>
            </div>
            <div className="space-y-3">
              {projectTasks.slice(0, 5).map((task) => (
                <div key={task._id} className="rounded-2xl border border-brand-100 p-3">
                  <div className="font-semibold text-ink text-sm">{task.title}</div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="text-xs text-soft">
                      {statusLabel(task.status)} • {formatDate(task.dueDate)}
                    </div>
                    <Badge tone={task.priority}>{task.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="border-t border-brand-100 pt-6 flex gap-3">
          <PrimaryButton
            onClick={() => onEdit(project)}
            className="flex-1"
          >
            <PencilLine className="h-4 w-4" />
            Edit Project
          </PrimaryButton>
          {onDelete ? (
            <button
              onClick={() => {
                onDelete(project._id);
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
