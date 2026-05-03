import { useState } from "react";
import FormModal from "./FormModal.jsx";
import { Field, Input, Select } from "./ui.jsx";

export default function UploadFileModal({ open, onClose, onSubmit, loading, projects, users }) {
  const [form, setForm] = useState({
    file: null,
    name: "",
    description: "",
    project: "",
    sharedWith: []
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleShare(userId) {
    setForm((current) => ({
      ...current,
      sharedWith: current.sharedWith.includes(userId)
        ? current.sharedWith.filter((id) => id !== userId)
        : [...current.sharedWith, userId]
    }));
  }

  function resetForm() {
    setForm({ file: null, name: "", description: "", project: "", sharedWith: [] });
  }

  function handleSubmit() {
    if (!form.file) {
      return;
    }
    onSubmit(form);
    resetForm();
  }

  if (!open) return null;

  return (
    <FormModal
      open={open}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title="Upload File"
      subtitle="Add files to your workspace with optional sharing settings."
      onSubmit={handleSubmit}
      submitLabel="Upload File"
      loading={loading}
    >
      <Field label="File">
        <Input
          type="file"
          onChange={(event) => update("file", event.target.files?.[0] || null)}
          required
          disabled={loading}
        />
      </Field>

      <Field label="Name">
        <Input
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Leave blank to use filename"
          disabled={loading}
        />
      </Field>

      <Field label="Project">
        <Select
          value={form.project}
          onChange={(event) => update("project", event.target.value)}
          disabled={loading}
        >
          <option value="">Workspace root</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Description">
        <Input
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Optional description"
          disabled={loading}
        />
      </Field>

      <Field label="Share With">
        <div className="space-y-2">
          {users.length === 0 ? (
            <div className="text-sm text-soft">No team members to share with</div>
          ) : (
            users.map((user) => (
              <label
                key={user._id}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={form.sharedWith.includes(user._id)}
                  onChange={() => toggleShare(user._id)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{user.name}</div>
                  <div className="text-xs text-soft">{user.email}</div>
                </div>
              </label>
            ))
          )}
        </div>
      </Field>
    </FormModal>
  );
}
