import { useState } from "react";

import FormModal from "./FormModal.jsx";
import { Field, Input, Select, TextArea } from "./ui.jsx";

export default function CreateProjectModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  users = []
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
    priority: "medium",
    progress: 0,
    startDate: "",
    dueDate: "",
    category: "",
    color: "#7c3aed",
    members: []
  });

  function toggleMember(userId) {
    setForm((current) => ({
      ...current,
      members: current.members.includes(userId)
        ? current.members.filter((id) => id !== userId)
        : [...current.members, userId]
    }));
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      status: "active",
      priority: "medium",
      progress: 0,
      startDate: "",
      dueDate: "",
      category: "",
      color: "#7c3aed",
      members: []
    });
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      alert("Project name is required");
      return;
    }
    onSubmit({
      ...form,
      progress: Number(form.progress) || 0,
      members: form.members
    });
    resetForm();
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Create New Project"
      subtitle="Add a new project to your workspace"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create Project"
      size="md"
    >
      <Field label="Project Name *">
        <Input
          value={form.name}
          onChange={(e) =>
            setForm((current) => ({ ...current, name: e.target.value }))
          }
          disabled={loading}
          placeholder="Enter project name"
        />
      </Field>

      <Field label="Description">
        <TextArea
          value={form.description}
          onChange={(e) =>
            setForm((current) => ({ ...current, description: e.target.value }))
          }
          disabled={loading}
          placeholder="Describe your project..."
          rows={4}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) =>
              setForm((current) => ({ ...current, status: e.target.value }))
            }
            disabled={loading}
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
        <Field label="Start Date">
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm((current) => ({ ...current, startDate: e.target.value }))
            }
            disabled={loading}
          />
        </Field>

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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Category">
          <Input
            value={form.category}
            onChange={(e) =>
              setForm((current) => ({ ...current, category: e.target.value }))
            }
            disabled={loading}
            placeholder="e.g. Web, Mobile, Design"
          />
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

      <Field label="Project Members">
        <div className="grid max-h-48 gap-2 overflow-y-auto rounded-2xl border border-brand-100 p-3">
          {users.length === 0 ? (
            <div className="text-sm text-soft">No team members available</div>
          ) : (
            users.map((user) => (
              <label
                key={user._id}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-brand-50/50"
              >
                <input
                  type="checkbox"
                  checked={form.members.includes(user._id)}
                  onChange={() => toggleMember(user._id)}
                  disabled={loading}
                />
                <span className="text-sm font-medium text-ink">{user.name}</span>
                <span className="truncate text-xs text-soft">{user.email}</span>
              </label>
            ))
          )}
        </div>
      </Field>
    </FormModal>
  );
}
