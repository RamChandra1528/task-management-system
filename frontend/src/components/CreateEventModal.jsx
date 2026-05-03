import { useState } from "react";

import FormModal from "./FormModal.jsx";
import { Field, Input, Select } from "./ui.jsx";

export default function CreateEventModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  projects = [],
  tasks = [],
  users = []
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    project: "",
    task: "",
    priority: "medium",
    color: "#7c3aed"
  });

  function handleSubmit() {
    if (!form.title.trim()) {
      alert("Event title is required");
      return;
    }
    if (!form.start) {
      alert("Start date and time is required");
      return;
    }
    if (!form.end) {
      alert("End date and time is required");
      return;
    }

    if (new Date(form.start) >= new Date(form.end)) {
      alert("End time must be after start time");
      return;
    }

    onSubmit(form);

    setForm({
      title: "",
      description: "",
      start: "",
      end: "",
      project: "",
      task: "",
      priority: "medium",
      color: "#7c3aed"
    });
  }

  function updateEndTime() {
    if (form.start && !form.end) {
      const start = new Date(form.start);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour
      setForm((current) => ({
        ...current,
        end: end.toISOString().slice(0, 16)
      }));
    }
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Create New Event"
      subtitle="Add an event to your calendar"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create Event"
      size="md"
    >
      <Field label="Event Title *">
        <Input
          value={form.title}
          onChange={(e) =>
            setForm((current) => ({ ...current, title: e.target.value }))
          }
          disabled={loading}
          placeholder="e.g. Team Meeting, Project Review"
        />
      </Field>

      <Field label="Description">
        <Input
          value={form.description}
          onChange={(e) =>
            setForm((current) => ({ ...current, description: e.target.value }))
          }
          disabled={loading}
          placeholder="Add event details..."
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Start Date & Time *">
          <Input
            type="datetime-local"
            value={form.start}
            onChange={(e) => {
              setForm((current) => ({ ...current, start: e.target.value }));
              // Auto-set end time if not set
              if (!form.end) {
                setTimeout(updateEndTime, 0);
              }
            }}
            disabled={loading}
          />
        </Field>

        <Field label="End Date & Time *">
          <Input
            type="datetime-local"
            value={form.end}
            onChange={(e) =>
              setForm((current) => ({ ...current, end: e.target.value }))
            }
            disabled={loading}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Project">
          <Select
            value={form.project}
            onChange={(e) =>
              setForm((current) => ({ ...current, project: e.target.value }))
            }
            disabled={loading}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Task">
          <Select
            value={form.task}
            onChange={(e) =>
              setForm((current) => ({ ...current, task: e.target.value }))
            }
            disabled={loading}
          >
            <option value="">No task</option>
            {tasks.map((task) => (
              <option key={task._id} value={task._id}>
                {task.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Priority">
          <Select
            value={form.priority}
            onChange={(e) =>
              setForm((current) => ({ ...current, priority: e.target.value }))
            }
            disabled={loading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </Field>

        <Field label="Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.color}
              onChange={(e) =>
                setForm((current) => ({ ...current, color: e.target.value }))
              }
              disabled={loading}
              className="h-10 w-20 rounded border border-brand-200 cursor-pointer"
            />
            <span className="text-sm text-soft">{form.color}</span>
          </div>
        </Field>
      </div>
    </FormModal>
  );
}
