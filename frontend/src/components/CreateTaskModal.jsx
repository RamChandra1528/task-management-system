import { useState } from "react";

import FormModal from "./FormModal.jsx";
import { Field, Input, Select, TextArea } from "./ui.jsx";

export default function CreateTaskModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  projects = [],
  users = []
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    assignee: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    estimatedHours: 0,
    category: ""
  });

  const selectedProject = projects.find((project) => project._id === form.project);
  const projectMemberIds = new Set(
    selectedProject?.members?.map((member) => member._id || member) || []
  );
  const assigneeOptions = selectedProject
    ? users.filter((user) => projectMemberIds.has(user._id))
    : users;

  function handleSubmit() {
    if (!form.title.trim()) {
      alert("Task title is required");
      return;
    }
    if (!form.project) {
      alert("Project is required");
      return;
    }
    if (!form.assignee) {
      alert("Assignee is required");
      return;
    }

    onSubmit({
      ...form,
      estimatedHours: Number(form.estimatedHours) || 0
    });

    setForm({
      title: "",
      description: "",
      project: "",
      assignee: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      estimatedHours: 0,
      category: ""
    });
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Create New Task"
      subtitle="Add a new task to your workspace"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create Task"
      size="md"
    >
      <Field label="Task Title *">
        <Input
          value={form.title}
          onChange={(e) =>
            setForm((current) => ({ ...current, title: e.target.value }))
          }
          disabled={loading}
          placeholder="Enter task title"
        />
      </Field>

      <Field label="Description">
        <TextArea
          value={form.description}
          onChange={(e) =>
            setForm((current) => ({ ...current, description: e.target.value }))
          }
          disabled={loading}
          placeholder="Describe the task..."
          rows={4}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Project *">
          <Select
            value={form.project}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                project: e.target.value,
                assignee: ""
              }))
            }
            disabled={loading}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Assignee *">
          <Select
            value={form.assignee}
            onChange={(e) =>
              setForm((current) => ({ ...current, assignee: e.target.value }))
            }
            disabled={loading}
          >
            <option value="">Select assignee</option>
            {assigneeOptions.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) =>
              setForm((current) => ({ ...current, status: e.target.value }))
            }
            disabled={loading}
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Due Date">
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm((current) => ({ ...current, dueDate: e.target.value }))
            }
            disabled={loading}
          />
        </Field>

        <Field label="Estimated Hours">
          <Input
            type="number"
            min="0"
            value={form.estimatedHours}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                estimatedHours: e.target.value
              }))
            }
            disabled={loading}
            placeholder="0"
          />
        </Field>
      </div>

      <Field label="Category">
        <Input
          value={form.category}
          onChange={(e) =>
            setForm((current) => ({ ...current, category: e.target.value }))
          }
          disabled={loading}
          placeholder="e.g. Bug, Feature, Documentation"
        />
      </Field>
    </FormModal>
  );
}
