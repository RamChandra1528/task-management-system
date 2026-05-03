import { useState } from "react";

import FormModal from "./FormModal.jsx";
import { Field, Input, Select, TextArea } from "./ui.jsx";

const departments = [
  "General",
  "Development",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Operations",
  "HR"
];

export default function InviteMemberModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  teams = []
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    jobTitle: "",
    department: "General",
    team: "",
    role: "member"
  });

  function handleSubmit() {
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }
    if (!form.email.trim()) {
      alert("Email is required");
      return;
    }
    if (!form.password.trim()) {
      alert("Password is required");
      return;
    }

    onSubmit(form);
    
    setForm({
      name: "",
      email: "",
      password: "",
      jobTitle: "",
      department: "General",
      team: "",
      role: "member"
    });
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Invite Team Member"
      subtitle="Add a new member to your workspace"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Invite Member"
      size="md"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full Name *">
          <Input
            value={form.name}
            onChange={(e) =>
              setForm((current) => ({ ...current, name: e.target.value }))
            }
            disabled={loading}
            placeholder="John Doe"
          />
        </Field>

        <Field label="Email Address *">
          <Input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((current) => ({ ...current, email: e.target.value }))
            }
            disabled={loading}
            placeholder="john@example.com"
          />
        </Field>
      </div>

      <Field label="Password *">
        <Input
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm((current) => ({ ...current, password: e.target.value }))
          }
          disabled={loading}
          placeholder="••••••••"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Job Title">
          <Input
            value={form.jobTitle}
            onChange={(e) =>
              setForm((current) => ({ ...current, jobTitle: e.target.value }))
            }
            disabled={loading}
            placeholder="e.g. Software Engineer"
          />
        </Field>

        <Field label="Department">
          <Select
            value={form.department}
            onChange={(e) =>
              setForm((current) => ({ ...current, department: e.target.value }))
            }
            disabled={loading}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Team">
          <Select
            value={form.team}
            onChange={(e) =>
              setForm((current) => ({ ...current, team: e.target.value }))
            }
            disabled={loading}
          >
            <option value="">No team</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Role">
          <Select
            value={form.role}
            onChange={(e) =>
              setForm((current) => ({ ...current, role: e.target.value }))
            }
            disabled={loading}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
      </div>
    </FormModal>
  );
}
