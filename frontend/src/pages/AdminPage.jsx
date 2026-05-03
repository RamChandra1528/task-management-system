import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  File,
  Folder,
  ShieldCheck,
  Trash2,
  Users,
  UserCog
} from "lucide-react";

import {
  eventApi,
  fileApi,
  projectApi,
  taskApi,
  teamApi,
  userApi,
  workspaceApi
} from "../lib/api.js";
import { cn } from "../lib/utils.js";
import {
  Avatar,
  Badge,
  Card,
  Field,
  Input,
  LoadingState,
  Modal,
  PrimaryButton,
  SearchField,
  SecondaryButton,
  SectionTitle,
  Select,
  StatCard,
  TextArea,
  formatDate,
  statusLabel
} from "../components/ui.jsx";

const tabs = [
  { value: "workspace", label: "Workspace", icon: ShieldCheck },
  { value: "users", label: "Users", icon: UserCog },
  { value: "teams", label: "Teams", icon: Users },
  { value: "projects", label: "Projects", icon: Folder },
  { value: "tasks", label: "Tasks", icon: CheckSquare },
  { value: "events", label: "Events", icon: CalendarDays },
  { value: "files", label: "Files", icon: File }
];

const emptyForms = {
  workspace: {
    name: "",
    description: "",
    plan: "pro",
    defaultTaskView: "board",
    tasksPerPage: 25,
    theme: "light",
    compactMode: false
  },
  users: {
    name: "",
    email: "",
    password: "",
    role: "member",
    team: "",
    jobTitle: "",
    department: "",
    presence: "online",
    phone: "",
    location: "",
    bio: ""
  },
  teams: {
    name: "",
    description: "",
    department: "",
    lead: "",
    color: "#7c3aed",
    status: "active"
  },
  projects: {
    name: "",
    description: "",
    status: "active",
    priority: "medium",
    progress: 0,
    category: "",
    color: "#7c3aed",
    startDate: "",
    dueDate: "",
    members: [],
    teams: [],
    tags: ""
  },
  tasks: {
    title: "",
    description: "",
    project: "",
    assignee: "",
    status: "todo",
    priority: "medium",
    category: "",
    sprint: "",
    estimatedHours: 0,
    dueDate: "",
    tags: ""
  },
  events: {
    title: "",
    description: "",
    project: "",
    start: "",
    end: "",
    priority: "medium",
    color: "#7c3aed",
    attendees: [],
    tags: ""
  },
  files: {
    name: "",
    description: "",
    project: "",
    parentFolder: "",
    sharedWith: []
  }
};

function idOf(value) {
  return value?._id || value || "";
}

function idsOf(values = []) {
  return values.map(idOf).filter(Boolean);
}

function dateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function datetimeInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

function splitTags(value) {
  if (Array.isArray(value)) return value;
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function resourceLabel(item) {
  return item.name || item.title || item.email || "Untitled";
}

function AdminTable({ columns, rows, renderRow, emptyLabel }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-brand-100 bg-white">
      <div
        className="hidden gap-4 border-b border-brand-100 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 lg:grid"
        style={{ gridTemplateColumns: columns }}
      >
        <span>Name</span>
        <span>Details</span>
        <span>Status</span>
        <span className="text-right">Controls</span>
      </div>
      <div className="divide-y divide-brand-100">
        {rows.length ? (
          rows.map((row) => renderRow(row))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-soft">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
}

function MultiSelect({ label, options, value, onChange, placeholder = "Add item" }) {
  const selected = new Set(value);

  return (
    <Field label={label}>
      <div className="grid gap-3">
        <Select
          value=""
          onChange={(event) => {
            const next = event.target.value;
            if (!next) return;
            onChange(selected.has(next) ? value : [...value, next]);
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option._id} value={option._id}>
              {resourceLabel(option)}
            </option>
          ))}
        </Select>
        {value.length ? (
          <div className="flex flex-wrap gap-2">
            {value.map((id) => {
              const item = options.find((option) => option._id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600"
                >
                  {resourceLabel(item || { name: "Unknown" })}
                  <button onClick={() => onChange(value.filter((entry) => entry !== id))}>
                    x
                  </button>
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

function ResourceModal({
  tab,
  open,
  mode,
  form,
  setForm,
  users,
  teams,
  projects,
  files,
  onClose,
  onSubmit,
  pending
}) {
  const title = `${mode === "create" ? "Create" : "Edit"} ${tabs.find((item) => item.value === tab)?.label}`;

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="space-y-5">
        {tab === "workspace" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Workspace name">
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </Field>
              <Field label="Plan">
                <Select
                  value={form.plan}
                  onChange={(event) => setForm((current) => ({ ...current, plan: event.target.value }))}
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </Select>
              </Field>
            </div>
            <Field label="Description">
              <TextArea
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Default view">
                <Select
                  value={form.defaultTaskView}
                  onChange={(event) => setForm((current) => ({ ...current, defaultTaskView: event.target.value }))}
                >
                  <option value="board">Board</option>
                  <option value="list">List</option>
                </Select>
              </Field>
              <Field label="Tasks per page">
                <Input
                  type="number"
                  min="1"
                  value={form.tasksPerPage}
                  onChange={(event) => setForm((current) => ({ ...current, tasksPerPage: Number(event.target.value) }))}
                />
              </Field>
              <Field label="Theme">
                <Select
                  value={form.theme}
                  onChange={(event) => setForm((current) => ({ ...current, theme: event.target.value }))}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </Field>
              <Field label="Compact mode">
                <Select
                  value={String(form.compactMode)}
                  onChange={(event) => setForm((current) => ({ ...current, compactMode: event.target.value === "true" }))}
                >
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </Select>
              </Field>
            </div>
          </>
        ) : null}

        {tab === "users" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name">
                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </Field>
              <Field label={mode === "create" ? "Password" : "New password is managed outside this panel"}>
                <Input
                  type="password"
                  value={form.password}
                  disabled={mode === "edit"}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />
              </Field>
              <Field label="Role">
                <Select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>
              <Field label="Team">
                <Select value={form.team} onChange={(event) => setForm((current) => ({ ...current, team: event.target.value }))}>
                  <option value="">No team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Presence">
                <Select value={form.presence} onChange={(event) => setForm((current) => ({ ...current, presence: event.target.value }))}>
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="offline">Offline</option>
                </Select>
              </Field>
              <Field label="Job title">
                <Input value={form.jobTitle} onChange={(event) => setForm((current) => ({ ...current, jobTitle: event.target.value }))} />
              </Field>
              <Field label="Department">
                <Input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              </Field>
              <Field label="Location">
                <Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
              </Field>
            </div>
            <Field label="Bio">
              <TextArea rows={3} value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} />
            </Field>
          </>
        ) : null}

        {tab === "teams" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Team name">
                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </Field>
              <Field label="Department">
                <Input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} />
              </Field>
              <Field label="Lead">
                <Select value={form.lead} onChange={(event) => setForm((current) => ({ ...current, lead: event.target.value }))}>
                  <option value="">No lead</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
              <Field label="Color">
                <Input type="color" value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} />
              </Field>
            </div>
            <Field label="Description">
              <TextArea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </Field>
          </>
        ) : null}

        {tab === "projects" ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Project name">
                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="at-risk">At Risk</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                  <option value="on-hold">On Hold</option>
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </Field>
              <Field label="Progress">
                <Input type="number" min="0" max="100" value={form.progress} onChange={(event) => setForm((current) => ({ ...current, progress: Number(event.target.value) }))} />
              </Field>
              <Field label="Start date">
                <Input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
              </Field>
              <Field label="Due date">
                <Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </Field>
              <Field label="Category">
                <Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              </Field>
              <Field label="Tags">
                <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="ops, launch, design" />
              </Field>
              <Field label="Color">
                <Input type="color" value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} />
              </Field>
            </div>
            <Field label="Description">
              <TextArea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <MultiSelect label="Members" options={users} value={form.members} onChange={(members) => setForm((current) => ({ ...current, members }))} />
              <MultiSelect label="Teams" options={teams} value={form.teams} onChange={(teamsValue) => setForm((current) => ({ ...current, teams: teamsValue }))} />
            </div>
          </>
        ) : null}

        {tab === "tasks" ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Task title">
                <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </Field>
              <Field label="Project">
                <Select value={form.project} onChange={(event) => setForm((current) => ({ ...current, project: event.target.value }))}>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Assignee">
                <Select value={form.assignee} onChange={(event) => setForm((current) => ({ ...current, assignee: event.target.value }))}>
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="backlog">Backlog</option>
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </Field>
              <Field label="Due date">
                <Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </Field>
              <Field label="Category">
                <Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              </Field>
              <Field label="Sprint">
                <Input value={form.sprint} onChange={(event) => setForm((current) => ({ ...current, sprint: event.target.value }))} />
              </Field>
              <Field label="Estimated hours">
                <Input type="number" min="0" value={form.estimatedHours} onChange={(event) => setForm((current) => ({ ...current, estimatedHours: Number(event.target.value) }))} />
              </Field>
              <Field label="Tags">
                <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
              </Field>
            </div>
            <Field label="Description">
              <TextArea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </Field>
          </>
        ) : null}

        {tab === "events" ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Event title">
                <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </Field>
              <Field label="Project">
                <Select value={form.project} onChange={(event) => setForm((current) => ({ ...current, project: event.target.value }))}>
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </Field>
              <Field label="Start">
                <Input type="datetime-local" value={form.start} onChange={(event) => setForm((current) => ({ ...current, start: event.target.value }))} />
              </Field>
              <Field label="End">
                <Input type="datetime-local" value={form.end} onChange={(event) => setForm((current) => ({ ...current, end: event.target.value }))} />
              </Field>
              <Field label="Color">
                <Input type="color" value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} />
              </Field>
              <Field label="Tags">
                <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
              </Field>
            </div>
            <Field label="Description">
              <TextArea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </Field>
            <MultiSelect label="Attendees" options={users} value={form.attendees} onChange={(attendees) => setForm((current) => ({ ...current, attendees }))} />
          </>
        ) : null}

        {tab === "files" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Project">
              <Select value={form.project} onChange={(event) => setForm((current) => ({ ...current, project: event.target.value }))}>
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Parent folder">
              <Select value={form.parentFolder} onChange={(event) => setForm((current) => ({ ...current, parentFolder: event.target.value }))}>
                <option value="">No parent</option>
                {files.filter((file) => file.kind === "folder").map((folder) => (
                  <option key={folder._id} value={folder._id}>{folder.name}</option>
                ))}
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <TextArea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <MultiSelect label="Shared with" options={users} value={form.sharedWith} onChange={(sharedWith) => setForm((current) => ({ ...current, sharedWith }))} />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onSubmit} disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("workspace");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "edit", item: null });
  const [form, setForm] = useState(emptyForms.workspace);
  const [error, setError] = useState("");

  const workspaceQuery = useQuery({ queryKey: ["workspace"], queryFn: workspaceApi.get });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: userApi.list });
  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: teamApi.list });
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: projectApi.list });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: taskApi.list });
  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: eventApi.list });
  const filesQuery = useQuery({ queryKey: ["files"], queryFn: fileApi.list });

  const workspace = workspaceQuery.data || {};
  const users = usersQuery.data || [];
  const teams = teamsQuery.data || [];
  const projects = projectsQuery.data || [];
  const tasks = tasksQuery.data || [];
  const events = eventsQuery.data || [];
  const files = filesQuery.data || [];
  const loading = [
    workspaceQuery,
    usersQuery,
    teamsQuery,
    projectsQuery,
    tasksQuery,
    eventsQuery,
    filesQuery
  ].some((query) => query.isLoading);

  const resources = {
    workspace: workspace ? [workspace] : [],
    users,
    teams,
    projects,
    tasks,
    events,
    files
  };

  const filteredRows = useMemo(() => {
    const rows = resources[activeTab] || [];
    if (activeTab === "workspace") return rows;
    const term = search.toLowerCase();
    return rows.filter((row) =>
      [row.name, row.title, row.email, row.description, row.department, row.status, row.priority]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [activeTab, resources, search]);

  function invalidateAll() {
    ["workspace", "users", "teams", "projects", "tasks", "events", "files", "dashboard", "reports"].forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (activeTab === "workspace") {
        return workspaceApi.update({
          name: form.name,
          description: form.description,
          plan: form.plan,
          settings: {
            defaultTaskView: form.defaultTaskView,
            tasksPerPage: form.tasksPerPage,
            theme: form.theme,
            compactMode: form.compactMode
          }
        });
      }

      if (activeTab === "users") {
        const payload = { ...form, team: form.team || undefined };
        if (modal.mode === "edit") {
          delete payload.password;
          return userApi.update(modal.item._id, payload);
        }
        return userApi.create(payload);
      }

      if (activeTab === "teams") {
        const payload = { ...form, lead: form.lead || undefined };
        return modal.mode === "create"
          ? teamApi.create(payload)
          : teamApi.update(modal.item._id, payload);
      }

      if (activeTab === "projects") {
        const payload = {
          ...form,
          startDate: form.startDate || undefined,
          dueDate: form.dueDate || undefined,
          tags: splitTags(form.tags)
        };
        return modal.mode === "create"
          ? projectApi.create(payload)
          : projectApi.update(modal.item._id, payload);
      }

      if (activeTab === "tasks") {
        const payload = {
          ...form,
          dueDate: form.dueDate || undefined,
          tags: splitTags(form.tags)
        };
        return modal.mode === "create"
          ? taskApi.create(payload)
          : taskApi.update(modal.item._id, payload);
      }

      if (activeTab === "events") {
        const payload = {
          ...form,
          project: form.project || undefined,
          tags: splitTags(form.tags)
        };
        return modal.mode === "create"
          ? eventApi.create(payload)
          : eventApi.update(modal.item._id, payload);
      }

      if (activeTab === "files") {
        const payload = {
          ...form,
          project: form.project || undefined,
          parentFolder: form.parentFolder || undefined
        };
        return modal.mode === "create"
          ? fileApi.createFolder(payload)
          : fileApi.update(modal.item._id, payload);
      }
      return null;
    },
    onSuccess: () => {
      invalidateAll();
      setModal({ open: false, mode: "edit", item: null });
      setError("");
    },
    onError: (mutationError) => setError(mutationError.message)
  });

  const deleteMutation = useMutation({
    mutationFn: ({ tab, id }) => {
      if (tab === "users") return userApi.remove(id);
      if (tab === "teams") return teamApi.remove(id);
      if (tab === "projects") return projectApi.remove(id);
      if (tab === "tasks") return taskApi.remove(id);
      if (tab === "events") return eventApi.remove(id);
      if (tab === "files") return fileApi.remove(id);
      return Promise.resolve();
    },
    onSuccess: invalidateAll,
    onError: (mutationError) => setError(mutationError.message)
  });

  function openCreate() {
    setError("");
    setForm(emptyForms[activeTab]);
    setModal({ open: true, mode: "create", item: null });
  }

  function openEdit(item) {
    setError("");
    if (activeTab === "workspace") {
      setForm({
        ...emptyForms.workspace,
        name: item.name || "",
        description: item.description || "",
        plan: item.plan || "pro",
        defaultTaskView: item.settings?.defaultTaskView || "board",
        tasksPerPage: item.settings?.tasksPerPage || 25,
        theme: item.settings?.theme || "light",
        compactMode: Boolean(item.settings?.compactMode)
      });
    }
    if (activeTab === "users") {
      setForm({
        ...emptyForms.users,
        ...item,
        team: idOf(item.team),
        password: ""
      });
    }
    if (activeTab === "teams") {
      setForm({ ...emptyForms.teams, ...item, lead: idOf(item.lead) });
    }
    if (activeTab === "projects") {
      setForm({
        ...emptyForms.projects,
        ...item,
        startDate: dateInput(item.startDate),
        dueDate: dateInput(item.dueDate),
        members: idsOf(item.members),
        teams: idsOf(item.teams),
        tags: (item.tags || []).join(", ")
      });
    }
    if (activeTab === "tasks") {
      setForm({
        ...emptyForms.tasks,
        ...item,
        project: idOf(item.project),
        assignee: idOf(item.assignee),
        dueDate: dateInput(item.dueDate),
        tags: (item.tags || []).join(", ")
      });
    }
    if (activeTab === "events") {
      setForm({
        ...emptyForms.events,
        ...item,
        project: idOf(item.project),
        start: datetimeInput(item.start),
        end: datetimeInput(item.end),
        attendees: idsOf(item.attendees),
        tags: (item.tags || []).join(", ")
      });
    }
    if (activeTab === "files") {
      setForm({
        ...emptyForms.files,
        ...item,
        project: idOf(item.project),
        parentFolder: idOf(item.parentFolder),
        sharedWith: idsOf(item.sharedWith)
      });
    }
    setModal({ open: true, mode: "edit", item });
  }

  function confirmDelete(item) {
    if (!window.confirm(`Delete ${resourceLabel(item)}? This action cannot be undone.`)) return;
    deleteMutation.mutate({ tab: activeTab, id: item._id });
  }

  function rowDetails(item) {
    if (activeTab === "users") return `${item.jobTitle || "Team member"} - ${item.email}`;
    if (activeTab === "teams") return `${item.department || "No department"} - ${item.memberCount || 0} members`;
    if (activeTab === "projects") return `${item.progress || 0}% complete - Due ${formatDate(item.dueDate)}`;
    if (activeTab === "tasks") return `${item.project?.name || "No project"} - ${item.assignee?.name || "Unassigned"}`;
    if (activeTab === "events") return `${formatDate(item.start)} - ${item.project?.name || "No project"}`;
    if (activeTab === "files") return `${item.kind} - ${item.sizeLabel || "0 B"} - ${item.project?.name || "No project"}`;
    return item.description || "Workspace settings and access policy";
  }

  function rowStatus(item) {
    if (activeTab === "users") return item.role;
    if (activeTab === "workspace") return item.plan;
    return item.status || item.priority || item.kind;
  }

  if (loading) {
    return <LoadingState label="Loading admin controls..." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Admin Control Center"
        subtitle="Manage workspace settings, people, teams, projects, tasks, events, files, and permissions from one place."
        action={
          activeTab === "workspace" ? (
            <PrimaryButton onClick={() => openEdit(workspace)}>Edit Workspace</PrimaryButton>
          ) : (
            <PrimaryButton onClick={openCreate}>
              {activeTab === "files" ? "Create Folder" : `Create ${tabs.find((tab) => tab.value === activeTab)?.label.slice(0, -1)}`}
            </PrimaryButton>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={UserCog} title="Admins" value={users.filter((user) => user.role === "admin").length} note="Full access users" />
        <StatCard icon={BriefcaseBusiness} title="Projects" value={projects.length} note={`${projects.filter((project) => project.status === "active").length} active`} />
        <StatCard icon={CheckSquare} title="Tasks" value={tasks.length} note={`${tasks.filter((task) => task.status !== "done").length} open`} />
        <StatCard icon={File} title="Files" value={files.length} note={`${files.filter((file) => file.kind === "folder").length} folders`} />
      </div>

      {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-500">{error}</div> : null}

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setSearch("");
                  setError("");
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  activeTab === tab.value
                    ? "bg-brand-50 text-brand-600"
                    : "text-soft hover:bg-brand-50/70 hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {activeTab !== "workspace" ? (
        <SearchField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search ${tabs.find((tab) => tab.value === activeTab)?.label.toLowerCase()}...`}
        />
      ) : null}

      <AdminTable
        columns="1.3fr 1.7fr 0.8fr 1fr"
        rows={filteredRows}
        emptyLabel="No records found."
        renderRow={(item) => (
          <div key={item._id || "workspace"} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.3fr_1.7fr_0.8fr_1fr] lg:items-center">
            <div className="flex min-w-0 items-center gap-3">
              {activeTab === "users" ? <Avatar user={item} size="sm" /> : null}
              <div className="min-w-0">
                <div className="truncate font-bold text-ink">{resourceLabel(item)}</div>
                <div className="text-xs text-soft lg:hidden">{rowDetails(item)}</div>
              </div>
            </div>
            <div className="hidden text-sm text-soft lg:block">{rowDetails(item)}</div>
            <div>
              <Badge tone={rowStatus(item)}>{statusLabel(rowStatus(item)) || rowStatus(item)}</Badge>
            </div>
            <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
              <SecondaryButton onClick={() => openEdit(item)}>Edit</SecondaryButton>
              {activeTab !== "workspace" ? (
                <button
                  onClick={() => confirmDelete(item)}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        )}
      />

      <ResourceModal
        tab={activeTab}
        open={modal.open}
        mode={modal.mode}
        form={form}
        setForm={setForm}
        users={users}
        teams={teams}
        projects={projects}
        files={files}
        onClose={() => setModal({ open: false, mode: "edit", item: null })}
        onSubmit={() => saveMutation.mutate()}
        pending={saveMutation.isPending}
      />
    </div>
  );
}
