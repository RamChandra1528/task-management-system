import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, LayoutGrid, List, PencilLine } from "lucide-react";

import {
  ActionLink,
  AvatarGroup,
  Badge,
  Card,
  Field,
  Input,
  LoadingState,
  Modal,
  PrimaryButton,
  ProgressBar,
  SearchField,
  SectionTitle,
  Select,
  SecondaryButton
} from "../components/ui.jsx";
import { projectApi, taskApi } from "../lib/api.js";
import { formatDate, statusLabel } from "../lib/utils.js";

const filters = [
  { value: "all", label: "All Projects" },
  { value: "active", label: "Active" },
  { value: "at-risk", label: "At Risk" },
  { value: "archived", label: "Archived" }
];

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.list
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskApi.list
  });

  const visibleProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesSearch =
        !search ||
        `${project.name} ${project.description} ${project.category}`
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [projects, search, statusFilter]);

  const [selectedId, setSelectedId] = useState("");

  const selectedProject =
    visibleProjects.find((project) => project._id === selectedId) ||
    visibleProjects[0] ||
    null;

  const projectTasks = useMemo(
    () => tasks.filter((task) => task.project?._id === selectedProject?._id),
    [selectedProject?._id, tasks]
  );

  const updateProject = useMutation({
    mutationFn: ({ id, payload }) => projectApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditing(null);
    }
  });

  if (isLoading) {
    return <LoadingState label="Loading projects..." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Projects" subtitle="Browse and manage all workspace projects" />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    statusFilter === filter.value
                      ? "border-brand-200 bg-brand-50 text-brand-600"
                      : "border-brand-100 bg-white text-soft"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <SecondaryButton>
                <Filter className="h-4 w-4" />
                Filter
              </SecondaryButton>
              <SecondaryButton>
                <LayoutGrid className="h-4 w-4" />
              </SecondaryButton>
              <SecondaryButton>
                <List className="h-4 w-4" />
              </SecondaryButton>
            </div>
          </div>

          <SearchField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {visibleProjects.map((project) => (
              <button
                key={project._id}
                onClick={() => setSelectedId(project._id)}
                className={`text-left transition ${
                  selectedProject?._id === project._id ? "scale-[1.01]" : ""
                }`}
              >
                <Card className="h-full p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <h3 className="text-2xl font-bold text-ink">{project.name}</h3>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-7 text-soft">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.tags?.map((tag) => (
                      <Badge key={tag} tone={project.priority}>
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <AvatarGroup users={project.members} extraLabel={`+${Math.max(0, project.members.length - 4)}`} />
                    <div className="min-w-[120px]">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-soft">Progress</span>
                        <span className="font-semibold text-ink">{project.progress}%</span>
                      </div>
                      <ProgressBar value={project.progress} color={project.color} />
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-soft">
                    Due: {formatDate(project.dueDate)}
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>

        <div>
          {selectedProject ? (
            <Card className="sticky top-28 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: selectedProject.color }}
                    />
                    <h3 className="text-2xl font-bold text-ink">{selectedProject.name}</h3>
                  </div>
                  <div className="mt-2 text-soft">{selectedProject.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <SecondaryButton onClick={() => setEditing(selectedProject)}>
                    <PencilLine className="h-4 w-4" />
                    Edit
                  </SecondaryButton>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-6 border-b border-brand-100 pb-4 text-sm font-semibold text-soft">
                <span className="border-b-2 border-brand-500 pb-3 text-brand-600">
                  Overview
                </span>
                <span>Tasks {projectTasks.length}</span>
                <span>Files</span>
                <span>Team {selectedProject.members?.length || 0}</span>
                <span>Activity</span>
              </div>

              <div className="mt-6">
                <div className="text-lg font-bold text-ink">Description</div>
                <p className="mt-3 leading-8 text-soft">{selectedProject.description}</p>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InfoBlock label="Project Owner" value={selectedProject.owner?.name} />
                <InfoBlock label="Due Date" value={formatDate(selectedProject.dueDate)} />
                <InfoBlock label="Start Date" value={formatDate(selectedProject.startDate)} />
                <InfoBlock
                  label="Status"
                  value={selectedProject.status}
                  badgeTone={selectedProject.status}
                />
                <InfoBlock
                  label="Priority"
                  value={selectedProject.priority}
                  badgeTone={selectedProject.priority}
                />
                <div className="grid gap-2">
                  <div className="text-sm text-soft">Progress</div>
                  <ProgressBar
                    value={selectedProject.progress}
                    color={selectedProject.color}
                  />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-ink">Team Members</div>
                  <ActionLink>View All</ActionLink>
                </div>
                <div className="mt-4">
                  <AvatarGroup
                    users={selectedProject.members}
                    extraLabel={`+${Math.max(0, selectedProject.members.length - 4)}`}
                  />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-ink">Recent Activity</div>
                  <ActionLink>View All</ActionLink>
                </div>
                <div className="mt-4 space-y-4">
                  {projectTasks.slice(0, 4).map((task) => (
                    <div key={task._id} className="rounded-2xl border border-brand-100 px-4 py-3">
                      <div className="font-semibold text-ink">{task.title}</div>
                      <div className="mt-1 text-sm text-soft">
                        {statusLabel(task.status)} • {formatDate(task.dueDate)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <LoadingState label="Choose a project to inspect its details." />
          )}
        </div>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Project"
        subtitle="Update the selected project details."
      >
        {editing ? (
          <ProjectEditor
            project={editing}
            saving={updateProject.isPending}
            onSubmit={(payload) =>
              updateProject.mutate({
                id: editing._id,
                payload
              })
            }
          />
        ) : null}
      </Modal>
    </div>
  );
}

function ProjectEditor({ project, saving, onSubmit }) {
  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    progress: project.progress,
    dueDate: project.dueDate?.slice?.(0, 10) || "",
    startDate: project.startDate?.slice?.(0, 10) || ""
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Project Name">
          <Input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </Field>
        <Field label="Progress">
          <Input
            type="number"
            value={form.progress}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                progress: Number(event.target.value)
              }))
            }
          />
        </Field>
      </div>
      <Field label="Description">
        <Input
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="active">Active</option>
            <option value="at-risk">At Risk</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
        <Field label="Priority">
          <Select
            value={form.priority}
            onChange={(event) =>
              setForm((current) => ({ ...current, priority: event.target.value }))
            }
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Start Date">
          <Input
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, startDate: event.target.value }))
            }
          />
        </Field>
        <Field label="Due Date">
          <Input
            type="date"
            value={form.dueDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, dueDate: event.target.value }))
            }
          />
        </Field>
      </div>
      <div className="flex justify-end gap-3">
        <SecondaryButton onClick={() => onSubmit(form)} disabled={saving}>
          {saving ? "Saving..." : "Save Project"}
        </SecondaryButton>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, badgeTone }) {
  return (
    <div className="grid gap-2">
      <div className="text-sm text-soft">{label}</div>
      {badgeTone ? <Badge tone={badgeTone}>{statusToneLabel(value)}</Badge> : <div className="font-semibold text-ink">{value}</div>}
    </div>
  );
}

function statusToneLabel(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
