import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Calendar,
  CheckSquare,
  ChevronDown,
  Crown,
  File,
  Folder,
  Home,
  KanbanSquare,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  X
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  eventApi,
  notificationApi,
  projectApi,
  taskApi,
  userApi
} from "../../lib/api.js";
import { cn } from "../../lib/utils.js";
import {
  Avatar,
  Card,
  Field,
  Input,
  LogoMark,
  Modal,
  PrimaryButton,
  SecondaryButton,
  Select
} from "../ui.jsx";

const navigation = [
  { to: "/app/overview", label: "Overview", icon: Home },
  { to: "/app/projects", label: "Projects", icon: Folder },
  { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/app/board", label: "Board", icon: KanbanSquare },
  { to: "/app/calendar", label: "Calendar", icon: Calendar },
  { to: "/app/team", label: "Team", icon: Users },
  { to: "/app/reports", label: "Reports", icon: BarChart3 },
  { to: "/app/files", label: "Files", icon: File },
  { to: "/app/settings", label: "Settings", icon: Settings }
];

function Sidebar({ mobile, onClose }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "sidebar-shell soft-scrollbar flex flex-col border-r border-brand-100 bg-white/90 backdrop-blur-xl",
        mobile ? "w-[280px]" : "w-[260px]"
      )}
    >
      <div className="sidebar-logo flex items-center justify-between px-8 py-8">
        <LogoMark />
        {mobile ? (
          <button
            onClick={onClose}
            className="rounded-2xl border border-brand-100 p-2 text-soft"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="sidebar-nav space-y-1 px-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "sidebar-nav-link flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-semibold transition",
                  isActive
                    ? "bg-brand-50 text-brand-600"
                    : "text-ink hover:bg-brand-50/60 hover:text-brand-600"
                )
              }
              onClick={mobile ? onClose : undefined}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer mt-auto space-y-6 px-6 pb-6 pt-8">
        <Card className="sidebar-upgrade p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-ink">
            <Crown className="h-4 w-4 text-amber-500" />
            Upgrade to Pro
          </div>
          <p className="mt-3 text-sm leading-6 text-soft">
            Unlock all features and boost your productivity.
          </p>
          <PrimaryButton className="mt-5 w-full justify-center">
            Upgrade Now
          </PrimaryButton>
        </Card>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-3xl border border-brand-100 px-4 py-4 text-left transition hover:border-brand-200"
        >
          <Avatar user={user} size="md" showStatus />
          <div className="min-w-0">
            <div className="truncate font-bold text-ink">{user?.name}</div>
            <div className="truncate text-sm text-soft">{user?.jobTitle}</div>
          </div>
        </button>
      </div>
    </aside>
  );
}

function QuickCreateModal({ open, onClose }) {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [type, setType] = useState("task");
  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    assignee: "",
    priority: "medium",
    dueDate: "",
    name: "",
    status: "active",
    start: "",
    end: "",
    attendees: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.list,
    enabled: open
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.list,
    enabled: open
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (type === "task") {
        return taskApi.create({
          title: form.title,
          description: form.description,
          project: form.project,
          assignee: form.assignee,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          status: "todo",
          category: "General"
        });
      }

      if (type === "project") {
        return projectApi.create({
          name: form.name,
          description: form.description,
          status: form.status,
          priority: form.priority,
          startDate: form.start || undefined,
          dueDate: form.dueDate || undefined,
          members: users.length ? [users[0]._id] : [],
          teams: []
        });
      }

      return eventApi.create({
        title: form.title,
        description: form.description,
        project: form.project || undefined,
        attendees: form.attendees,
        priority: form.priority,
        start: form.start,
        end: form.end
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
      setForm({
        title: "",
        description: "",
        project: "",
        assignee: "",
        priority: "medium",
        dueDate: "",
        name: "",
        status: "active",
        start: "",
        end: "",
        attendees: []
      });
    }
  });

  const allowedTypes = useMemo(
    () => [
      { value: "task", label: "Task" },
      ...(isAdmin ? [{ value: "project", label: "Project" }] : []),
      { value: "event", label: "Event" }
    ],
    [isAdmin]
  );
  const selectedProject = projects.find((project) => project._id === form.project);
  const selectedProjectMemberIds = new Set(
    selectedProject?.members?.map((member) => member._id || member) || []
  );
  const taskAssigneeOptions =
    type === "task" && selectedProjectMemberIds.size
      ? users.filter((person) => selectedProjectMemberIds.has(person._id))
      : users;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Something New"
      subtitle="Quickly add fresh work to your workspace."
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Type">
            <Select value={type} onChange={(event) => setType(event.target.value)}>
              {allowedTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={type === "project" ? "Project name" : "Title"}>
            <Input
              value={type === "project" ? form.name : form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [type === "project" ? "name" : "title"]: event.target.value
                }))
              }
              placeholder={
                type === "project" ? "Aurora Refresh Initiative" : "Design system update"
              }
            />
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

        <Field label="Description">
          <Input
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Write a short summary..."
          />
        </Field>

        {type !== "project" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Project">
              <Select
                value={form.project}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    project: event.target.value,
                    assignee: type === "task" ? "" : current.assignee
                  }))
                }
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </Field>
            {type === "task" ? (
              <Field label="Assignee">
                <Select
                  value={form.assignee}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, assignee: event.target.value }))
                  }
                >
                  <option value="">Select a teammate</option>
                  {taskAssigneeOptions.map((person) => (
                    <option key={person._id} value={person._id}>
                      {person.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field label="Attendees">
                <Select
                  value=""
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) return;
                    setForm((current) => ({
                      ...current,
                      attendees: current.attendees.includes(value)
                        ? current.attendees
                        : [...current.attendees, value]
                    }));
                  }}
                >
                  <option value="">Add attendee</option>
                  {users.map((person) => (
                    <option key={person._id} value={person._id}>
                      {person.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <Field label={type === "event" ? "Start date" : "Due date"}>
              <Input
                type="datetime-local"
                value={type === "event" ? form.start : form.dueDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [type === "event" ? "start" : "dueDate"]: event.target.value
                  }))
                }
              />
            </Field>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
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
              </Select>
            </Field>
            <Field label="Start date">
              <Input
                type="date"
                value={form.start}
                onChange={(event) =>
                  setForm((current) => ({ ...current, start: event.target.value }))
                }
              />
            </Field>
            <Field label="Due date">
              <Input
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dueDate: event.target.value }))
                }
              />
            </Field>
          </div>
        )}

        {type === "event" && form.attendees.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {form.attendees.map((memberId) => {
              const person = users.find((entry) => entry._id === memberId);
              return (
                <span
                  key={memberId}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600"
                >
                  {person?.name}
                  <button
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        attendees: current.attendees.filter((id) => id !== memberId)
                      }))
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : null}

        {type === "event" ? (
          <Field label="End date">
            <Input
              type="datetime-local"
              value={form.end}
              onChange={(event) =>
                setForm((current) => ({ ...current, end: event.target.value }))
              }
            />
          </Field>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Create"}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, workspace, unreadNotifications, setUnreadNotifications } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.list
  });

  const queryClient = useQueryClient();
  const readNotification = useMutation({
    mutationFn: notificationApi.read,
    onSuccess: (notification) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (!notification.read) return;
    }
  });

  const pageTitle = useMemo(() => {
    const active = navigation.find((item) => location.pathname.startsWith(item.to));
    return active?.label || "Overview";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-shell">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex">
        <Sidebar />
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 flex bg-ink/40 backdrop-blur-sm lg:hidden">
          <Sidebar mobile onClose={() => setMobileSidebarOpen(false)} />
          <button className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      ) : null}

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/80 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-2xl border border-brand-100 p-3 text-soft lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden min-w-[320px] max-w-[440px] flex-1 lg:block">
                <label className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-soft shadow-sm">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-ink placeholder:text-slate-400"
                    placeholder="Search projects, tasks, teams..."
                  />
                </label>
              </div>
              <div className="lg:hidden">
                <div className="text-sm text-soft">{pageTitle}</div>
                <div className="font-bold text-ink">{workspace?.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PrimaryButton icon={Plus} onClick={() => setCreateOpen(true)}>
                New
              </PrimaryButton>
              <div className="relative">
                <button
                  className="rounded-2xl border border-brand-100 bg-white p-3 text-soft transition hover:text-ink"
                  onClick={() => setNotificationsOpen((current) => !current)}
                >
                  <Bell className="h-5 w-5" />
                </button>
                {unreadNotifications ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unreadNotifications}
                  </span>
                ) : null}
                {notificationsOpen ? (
                  <div className="absolute right-0 top-14 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-[24px] border border-brand-100 bg-white p-3 shadow-2xl shadow-brand-500/10">
                    <div className="flex items-center justify-between px-2 py-2">
                      <div className="font-bold text-ink">Notifications</div>
                      <span className="text-xs font-semibold text-soft">
                        {unreadNotifications} unread
                      </span>
                    </div>
                    <div className="mt-2 max-h-[360px] space-y-2 overflow-y-auto pr-1 soft-scrollbar">
                      {notifications.length ? (
                        notifications.slice(0, 8).map((notification) => (
                          <button
                            key={notification._id}
                            className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                              notification.read
                                ? "bg-white hover:bg-brand-50/40"
                                : "bg-brand-50"
                            }`}
                            onClick={() => {
                              if (!notification.read) {
                                readNotification.mutate(notification._id);
                                setUnreadNotifications(Math.max(0, unreadNotifications - 1));
                              }
                              setNotificationsOpen(false);
                              if (notification.link) {
                                navigate(
                                  notification.link.startsWith("/app")
                                    ? notification.link
                                    : `/app${notification.link}`
                                );
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                                  notification.read ? "bg-slate-300" : "bg-brand-500"
                                }`}
                              />
                              <span>
                                <span className="block text-sm font-bold text-ink">
                                  {notification.title}
                                </span>
                                <span className="mt-1 block text-sm leading-6 text-soft">
                                  {notification.message}
                                </span>
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-sm text-soft">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <Link
                to="/app/settings"
                className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white px-3 py-2 shadow-sm"
              >
                <Avatar user={user} size="sm" />
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-bold text-ink">{workspace?.name}</div>
                  <div className="text-xs text-soft">{user?.role}</div>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-soft sm:block" />
              </Link>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-81px)] px-4 py-6 sm:px-8 lg:px-8">
          <Outlet />
        </main>
      </div>

      <QuickCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
