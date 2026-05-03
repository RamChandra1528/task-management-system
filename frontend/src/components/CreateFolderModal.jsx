import { useState } from "react";
import FormModal from "./FormModal.jsx";
import { Field, Input, Select } from "./ui.jsx";

export default function CreateFolderModal({ open, onClose, onSubmit, loading, projects }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    project: ""
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm({ name: "", description: "", project: "" });
  }

  function handleSubmit() {
    if (!form.name.trim()) {
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
      title="Create Folder"
      subtitle="Organize your files with new workspace folders."
      onSubmit={handleSubmit}
      submitLabel="Create Folder"
      loading={loading}
    >
      <Field label="Folder Name">
        <Input
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="e.g., Design Assets, Documentation"
          required
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
          placeholder="Optional description for this folder"
          disabled={loading}
        />
      </Field>
    </FormModal>
  );
}
