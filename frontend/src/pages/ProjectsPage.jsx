import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, LayoutGrid, List, Plus } from "lucide-react";

import ProjectDetailModal from "../components/ProjectDetailModal.jsx";
import {
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
  SecondaryButton,
  TextArea
} from "../components/ui.jsx";
import { projectApi, taskApi } from "../lib/api.js";
import { formatDate } from "../lib/utils.js";

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
  const [selectedId, setSelectedId] = useState("");
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

  const selectedProject = projects.find((p) => p._id === selectedId) || null;

  const updateProject = useMutation({
    mutationFn: ({ id, payload }) => projectApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditing(null);
    }
  });

  const deleteProject = useMutation({
    mutationFn: projectApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSelectedId("");
    }
  });

  if (isLoading) {
    return <LoadingState label="Loading projects..." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Projects" 
        subtitle="Browse and manage all workspace projects"
        action={
          <PrimaryButton>
            <Plus className="h-4 w-4" />
            New Project
          </PrimaryButton>
        }
      />

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

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <button
              key={project._id}
              onClick={() => setSelectedId(project._id)}
              className="text-left transition hover:scale-[1.02]"
            >
              <Card className="h-full p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <h3 className="text-lg font-bold text-ink truncate">{project.name}</h3>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-soft">
                      {project.description}
                    </p>
                  </div>
                </div>

                {project.tags && project.tags.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} tone={project.priority}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 flex items-center justify-between gap-4">
                  <AvatarGroup users={project.members?.slice(0, 4)} />
                  <div className="min-w-[100px] text-right">
                    <div className="text-sm font-semibold text-ink">{project.progress || 0}%</div>
                    <ProgressBar value={project.progress || 0} color={project.color} />
                  </div>
                </div>

                <div className="mt-4 text-xs text-soft">
                  Due: {formatDate(project.dueDate)}
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        open={!!selectedId}
        onClose={() => setSelectedId("")}
        project={selectedProject}
        tasks={tasks}
        busy={updateProject.isPending || deleteProject.isPending}
        onUpdate={(id, payload) => updateProject.mutate({ id, payload })}
        onDelete={(id) => deleteProject.mutate(id)}
        onEdit={setEditing}
      />

      {/* Edit Project Modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Project"
        subtitle="Update project details and settings"
        size="md"
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
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function ProjectEditor({ project, saving, onSubmit, onCancel }) {
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-5"
    >
      <Field label="Project Name">
        <Input
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          disabled={saving}
        />
      </Field>

      <Field label="Description">
        <TextArea
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          disabled={saving}
          rows={4}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({ ...current, status: event.target.value }))
            }
            disabled={saving}
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
            onChange={(event) =>
              setForm((current) => ({ ...current, priority: event.target.value }))
            }
            disabled={saving}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </Field>
      </div>

      <Field label="Progress">
        <Input
          type="number"
          min="0"
          max="100"
          value={form.progress}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              progress: Number(event.target.value)
            }))
          }
          disabled={saving}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Start Date">
          <Input
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, startDate: event.target.value }))
            }
            disabled={saving}
          />
        </Field>
        <Field label="Due Date">
          <Input
            type="date"
            value={form.dueDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, dueDate: event.target.value }))
            }
            disabled={saving}
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-4 border-t border-brand-100">
        <PrimaryButton type="submit" disabled={saving} className="flex-1">
          {saving ? "Saving..." : "Save Project"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onCancel} disabled={saving} className="flex-1">
          Cancel
        </SecondaryButton>
      </div>
    </form>
  );
}

function statusToneLabel(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
