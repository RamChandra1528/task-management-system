import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Filter,
  Folder,
  Image,
  LayoutGrid,
  List,
  MoreVertical,
  Paperclip,
  Presentation,
  Send,
  Share2
} from "lucide-react";

import {
  ActionLink,
  Avatar,
  AvatarGroup,
  Badge,
  Card,
  Field,
  Input,
  LoadingState,
  Modal,
  PrimaryButton,
  SearchField,
  SectionTitle,
  Select,
  SecondaryButton,
  StatCard
} from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fileApi, projectApi, userApi } from "../lib/api.js";
import { cn, formatDate, relativeToReference } from "../lib/utils.js";

const fileTabs = ["All Files", "My Files", "Shared with me", "Recent", "Trash"];

function sumBytes(files) {
  return files.reduce((total, file) => total + (file.sizeBytes || 0), 0);
}

function formatStorage(bytes) {
  if (!bytes) return "0 B";
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / 1024 / 1024;
  return `${Math.max(0.1, mb).toFixed(1)} MB`;
}

function fileIcon(file) {
  if (file.kind === "folder") return Folder;
  if (file.extension === "pdf") return FileText;
  if (file.extension === "xlsx") return FileSpreadsheet;
  if (file.extension === "png") return Image;
  if (file.extension === "pptx") return Presentation;
  return File;
}

function fileTone(file) {
  if (file.kind === "folder") return "bg-brand-50 text-brand-500";
  if (file.extension === "pdf") return "bg-rose-50 text-rose-500";
  if (file.extension === "xlsx") return "bg-emerald-50 text-emerald-600";
  if (file.extension === "png") return "bg-blue-50 text-blue-500";
  if (file.extension === "pptx") return "bg-orange-50 text-orange-500";
  return "bg-slate-100 text-soft";
}

export default function FilesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("All Files");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [note, setNote] = useState("");
  const [fileModal, setFileModal] = useState({ mode: null, file: null });

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: fileApi.list
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.list
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.list
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, payload }) => fileApi.comment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setNote("");
    }
  });

  const createFolderMutation = useMutation({
    mutationFn: fileApi.createFolder,
    onSuccess: (folder) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setSelectedId(folder._id);
      setFileModal({ mode: null, file: null });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: fileApi.upload,
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setSelectedId(file._id);
      setFileModal({ mode: null, file: null });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => fileApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setFileModal({ mode: null, file: null });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: fileApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setSelectedId("");
    }
  });

  const { user } = useAuth();
  const visibleFiles = useMemo(() => {
    return files.filter((file) => {
      const haystack = `${file.name} ${file.project?.name} ${file.uploadedBy?.name}`;
      const matchesSearch = !search || haystack.toLowerCase().includes(search.toLowerCase());
      const matchesTab =
        activeTab === "All Files" ||
        activeTab === "Recent" ||
        (activeTab === "Shared with me" && file.sharedWith?.length) ||
        (activeTab === "My Files" && file.uploadedBy?._id === user?._id) ||
        (activeTab === "Trash" && false);
      return matchesSearch && matchesTab;
    });
  }, [activeTab, files, search]);

  const selectedFile =
    files.find((file) => file._id === selectedId) ||
    files.find((file) => file.kind === "file") ||
    files[0] ||
    null;

  if (isLoading) {
    return <LoadingState label="Loading files..." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Files"
        subtitle="Store, organize and share project files with your team"
        action={
          <div className="flex flex-wrap gap-3">
            <SecondaryButton>
              <Filter className="h-4 w-4" />
              Filter
            </SecondaryButton>
            <SecondaryButton>Sort: Newest</SecondaryButton>
            <SecondaryButton>
              <List className="h-4 w-4" />
            </SecondaryButton>
            <SecondaryButton>
              <LayoutGrid className="h-4 w-4" />
            </SecondaryButton>
            <SecondaryButton onClick={() => setFileModal({ mode: "folder", file: null })}>
              <Folder className="h-4 w-4" />
              New Folder
            </SecondaryButton>
            <PrimaryButton onClick={() => setFileModal({ mode: "upload", file: null })}>
              Upload File
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.8fr_0.75fr]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Files" value={files.length} note="+ 18 this month" icon={Folder} />
            <StatCard
              title="Total Size"
              value={formatStorage(sumBytes(files))}
              note="+ 1.2 GB this month"
              icon={File}
              iconClassName="bg-blue-50 text-blue-500"
            />
            <StatCard
              title="Shared Files"
              value={files.filter((file) => file.sharedWith?.length).length}
              note="38% of total files"
              icon={Share2}
              iconClassName="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Downloads"
              value="1.2K"
              note="+ 120 this month"
              icon={Download}
              iconClassName="bg-amber-50 text-amber-500"
            />
          </div>

          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-100 px-5 py-4">
              <div className="flex flex-wrap gap-6 text-sm font-semibold text-soft">
                {fileTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "border-b-2 pb-3 transition",
                      activeTab === tab
                        ? "border-brand-500 text-brand-600"
                        : "border-transparent hover:text-ink"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="w-full sm:w-[280px]">
                <SearchField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search files..."
                />
              </div>
            </div>

            <div className="hidden grid-cols-[1.6fr_1fr_1.1fr_0.7fr_0.8fr_60px] gap-4 border-b border-brand-100 px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 lg:grid">
              <span>Name</span>
              <span>Project</span>
              <span>Uploaded by</span>
              <span>Size</span>
              <span>Updated</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-brand-100">
              {visibleFiles.slice(0, 10).map((file) => {
                const Icon = fileIcon(file);
                return (
                  <button
                    key={file._id}
                    onClick={() => setSelectedId(file._id)}
                    className={cn(
                      "grid w-full gap-4 px-5 py-4 text-left transition lg:grid-cols-[1.6fr_1fr_1.1fr_0.7fr_0.8fr_60px]",
                      selectedFile?._id === file._id
                        ? "bg-brand-50/60"
                        : "hover:bg-brand-50/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
                          fileTone(file)
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-bold text-ink">{file.name}</div>
                        <div className="mt-1 text-xs text-soft">
                          {file.kind === "folder"
                            ? `${file.sharedWith?.length || 0} shared members`
                            : `${file.sharedWith?.length || 0} collaborators`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {file.project ? <Badge>{file.project.name}</Badge> : <span className="text-soft">-</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar user={file.uploadedBy} size="sm" />
                      <span className="text-sm font-medium text-ink">{file.uploadedBy?.name}</span>
                    </div>
                    <div className="text-sm text-soft">{file.kind === "folder" ? "-" : file.sizeLabel}</div>
                    <div className="text-sm text-soft">{relativeToReference(file.updatedAt)}</div>
                    <div className="flex items-center text-soft">
                      <MoreVertical className="h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 text-sm text-soft">
              <span>
                Showing 1 to {Math.min(visibleFiles.length, 10)} of {visibleFiles.length} files
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={cn(
                      "h-10 w-10 rounded-2xl border",
                      page === 1
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-brand-100 bg-white"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {selectedFile ? (
          <Card className="sticky top-28 flex max-h-[calc(100vh-8rem)] flex-col p-6">
            <FilePanelHeader file={selectedFile} />
            <div className="mt-6 flex gap-3">
              <a
                href={selectedFile.kind === "file" ? fileApi.downloadUrl(selectedFile._id) : "#"}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20",
                  selectedFile.kind !== "file" && "pointer-events-none opacity-60"
                )}
              >
                <Eye className="h-4 w-4" />
                Preview
              </a>
              <SecondaryButton>
                <Download className="h-4 w-4" />
              </SecondaryButton>
              <SecondaryButton>
                <MoreVertical className="h-4 w-4" />
              </SecondaryButton>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <SecondaryButton
                className="justify-center"
                onClick={() => setFileModal({ mode: "edit", file: selectedFile })}
              >
                Edit
              </SecondaryButton>
              <SecondaryButton
                className="justify-center text-rose-500"
                onClick={() => deleteMutation.mutate(selectedFile._id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </SecondaryButton>
            </div>

            <div className="soft-scrollbar mt-6 flex-1 overflow-y-auto pr-1">
              <InfoSection title="File Information">
                <InfoLine label="Type" value={selectedFile.mimeType || "File"} />
                <InfoLine label="Size" value={selectedFile.kind === "folder" ? "-" : selectedFile.sizeLabel} />
                <InfoLine
                  label="Uploaded by"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <Avatar user={selectedFile.uploadedBy} size="sm" />
                      {selectedFile.uploadedBy?.name}
                    </span>
                  }
                />
                <InfoLine label="Uploaded" value={formatDate(selectedFile.createdAt, "MMM d, yyyy h:mm a")} />
                <InfoLine label="Location" value={`/${selectedFile.project?.name || "Workspace"}`} />
                <InfoLine
                  label="Shared with"
                  value={<AvatarGroup users={selectedFile.sharedWith || []} />}
                />
              </InfoSection>

              <InfoSection title="Description">
                <p className="text-sm leading-7 text-soft">{selectedFile.description}</p>
              </InfoSection>

              <InfoSection title="Activity">
                <div className="space-y-5">
                  {selectedFile.activity?.map((activity) => (
                    <div key={activity._id} className="flex items-start gap-3">
                      <Avatar user={activity.user} size="sm" />
                      <div>
                        <div className="text-sm font-semibold text-ink">
                          {activity.user?.name} {activity.note?.toLowerCase()}
                        </div>
                        <div className="mt-1 text-xs text-soft">
                          {formatDate(activity.createdAt, "MMM d, yyyy h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </InfoSection>
            </div>

            <form
              className="mt-5 flex items-center gap-2 rounded-2xl border border-brand-100 bg-white px-3 py-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!note.trim()) return;
                commentMutation.mutate({
                  id: selectedFile._id,
                  payload: { note }
                });
              }}
            >
              <Input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Write a comment..."
                className="border-none px-1 shadow-none focus:ring-0"
              />
              <Paperclip className="h-4 w-4 text-soft" />
              <button
                type="submit"
                className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-white"
                disabled={commentMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </Card>
        ) : null}
      </div>

      <Modal
        open={Boolean(fileModal.mode)}
        onClose={() => setFileModal({ mode: null, file: null })}
        title={
          fileModal.mode === "upload"
            ? "Upload File"
            : fileModal.mode === "folder"
              ? "Create Folder"
              : "Edit File"
        }
        subtitle="Organize files with real workspace metadata and access."
      >
        <FileActionForm
          mode={fileModal.mode}
          file={fileModal.file}
          projects={projects}
          users={users}
          saving={
            createFolderMutation.isPending ||
            uploadMutation.isPending ||
            updateMutation.isPending
          }
          error={
            createFolderMutation.error?.message ||
            uploadMutation.error?.message ||
            updateMutation.error?.message
          }
          onSubmit={(payload) => {
            if (fileModal.mode === "upload") {
              const formData = new FormData();
              formData.append("file", payload.file);
              formData.append("name", payload.name || payload.file.name);
              formData.append("description", payload.description || "");
              if (payload.project) formData.append("project", payload.project);
              formData.append("sharedWith", JSON.stringify(payload.sharedWith || []));
              uploadMutation.mutate(formData);
              return;
            }

            if (fileModal.mode === "folder") {
              createFolderMutation.mutate(payload);
              return;
            }

            updateMutation.mutate({
              id: fileModal.file._id,
              payload
            });
          }}
        />
      </Modal>
    </div>
  );
}

function FilePanelHeader({ file }) {
  const Icon = fileIcon(file);
  return (
    <div className="flex items-start gap-4">
      <div className={cn("grid h-14 w-14 place-items-center rounded-2xl", fileTone(file))}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xl font-bold text-ink">{file.name}</div>
        <div className="mt-1 text-sm text-soft">{file.project?.name}</div>
      </div>
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <div className="border-t border-brand-100 py-6 first:border-t-0 first:pt-0">
      <div className="mb-4 font-bold text-ink">{title}</div>
      {children}
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="grid grid-cols-[0.8fr_1.2fr] gap-4 py-2 text-sm">
      <span className="text-soft">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function FileActionForm({ mode, file, projects, users, saving, error, onSubmit }) {
  const [form, setForm] = useState({
    file: null,
    name: file?.name || "",
    description: file?.description || "",
    project: file?.project?._id || file?.project || "",
    sharedWith: file?.sharedWith?.map((user) => user._id || user) || []
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      {mode === "upload" ? (
        <Field label="File">
          <Input
            type="file"
            required
            onChange={(event) => update("file", event.target.files?.[0] || null)}
          />
        </Field>
      ) : null}

      <Field label={mode === "folder" ? "Folder Name" : "Name"}>
        <Input
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          required={mode !== "upload"}
          placeholder={mode === "upload" ? "Leave blank to use filename" : ""}
        />
      </Field>

      <Field label="Project">
        <Select value={form.project} onChange={(event) => update("project", event.target.value)}>
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
          placeholder="Describe this asset..."
        />
      </Field>

      {mode !== "folder" ? (
        <Field label="Shared With">
          <Select
            value=""
            onChange={(event) => {
              const value = event.target.value;
              if (!value) return;
              update(
                "sharedWith",
                form.sharedWith.includes(value) ? form.sharedWith : [...form.sharedWith, value]
              );
            }}
          >
            <option value="">Add teammate</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </Select>
          <div className="mt-3 flex flex-wrap gap-2">
            {form.sharedWith.map((id) => {
              const person = users.find((user) => user._id === id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    update(
                      "sharedWith",
                      form.sharedWith.filter((entry) => entry !== id)
                    )
                  }
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600"
                >
                  {person?.name || "User"} x
                </button>
              );
            })}
          </div>
        </Field>
      ) : null}

      {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-500">{error}</div> : null}

      <div className="flex justify-end">
        <PrimaryButton type="submit" disabled={saving || (mode === "upload" && !form.file)}>
          {saving
            ? "Saving..."
            : mode === "upload"
              ? "Upload"
              : mode === "folder"
                ? "Create Folder"
                : "Save Changes"}
        </PrimaryButton>
      </div>
    </form>
  );
}
