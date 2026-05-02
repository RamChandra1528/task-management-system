import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Globe,
  LayoutPanelLeft,
  Lock,
  Palette,
  ShieldCheck,
  UserRound
} from "lucide-react";

import { Avatar, Card, Field, Input, PrimaryButton, SectionTitle, Select } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { userApi, workspaceApi } from "../lib/api.js";

const settingTabs = [
  "Profile",
  "Account",
  "Workspace",
  "Members & Permissions",
  "Notifications",
  "Security",
  "Integrations",
  "Billing",
  "Appearance"
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, replaceSession, isAdmin, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: workspace } = useQuery({
    queryKey: ["workspace"],
    queryFn: workspaceApi.get
  });

  const [activeTab] = useState("Profile");
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    jobTitle: user?.jobTitle || "",
    bio: user?.bio || ""
  });
  const [preferences, setPreferences] = useState({
    defaultTaskView: user?.preferences?.defaultTaskView || "board",
    tasksPerPage: user?.preferences?.tasksPerPage || 25,
    theme: user?.preferences?.theme || "light",
    compactMode: user?.preferences?.compactMode || false,
    language: user?.preferences?.language || "English",
    timezone: user?.preferences?.timezone || "(GMT-05:00) Eastern Time",
    dateFormat: user?.preferences?.dateFormat || "MM/DD/YYYY",
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      assignments: user?.preferences?.notifications?.assignments ?? true,
      reminders: user?.preferences?.notifications?.reminders ?? true,
      mentions: user?.preferences?.notifications?.mentions ?? true,
      projectUpdates: user?.preferences?.notifications?.projectUpdates ?? false
    }
  });
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const profileMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (nextUser) => {
      replaceSession({ user: nextUser, workspace, unreadNotifications: 0 });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  const preferenceMutation = useMutation({
    mutationFn: userApi.updatePreferences,
    onSuccess: (nextUser) => {
      replaceSession({ user: nextUser, workspace, unreadNotifications: 0 });
    }
  });

  const workspaceMutation = useMutation({
    mutationFn: workspaceApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: userApi.removeMe,
    onSuccess: async () => {
      await logout();
      navigate("/", { replace: true });
    }
  });

  const preferenceItems = useMemo(
    () => [
      {
        label: "Email Notifications",
        description: "Receive emails for important updates.",
        key: "email"
      },
      {
        label: "Task Assignments",
        description: "When you're assigned to a task.",
        key: "assignments"
      },
      {
        label: "Task Reminders",
        description: "Receive reminders for due tasks.",
        key: "reminders"
      },
      {
        label: "Mentions",
        description: "When someone mentions you.",
        key: "mentions"
      },
      {
        label: "Project Updates",
        description: "Updates about projects you follow.",
        key: "projectUpdates"
      }
    ],
    []
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Settings"
        subtitle="Manage your account, workspace and preferences"
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_2.2fr_1fr]">
        <Card className="p-4">
          <div className="space-y-1">
            {settingTabs.map((tab) => (
              <button
                key={tab}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-semibold transition ${
                  tab === activeTab
                    ? "bg-brand-50 text-brand-600"
                    : "text-ink hover:bg-brand-50/60"
                }`}
              >
                <UserRound className="h-4 w-4" />
                {tab}
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="text-2xl font-bold text-ink">Profile Information</div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[180px_1fr]">
              <div className="flex flex-col items-center gap-4">
                <Avatar user={user} size="xl" />
              </div>
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Full Name">
                    <Input
                      value={profileForm.name}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          name: event.target.value
                        }))
                      }
                    />
                  </Field>
                  <Field label="Job Title">
                    <Input
                      value={profileForm.jobTitle}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          jobTitle: event.target.value
                        }))
                      }
                    />
                  </Field>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Email">
                    <Input
                      value={profileForm.email}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          email: event.target.value
                        }))
                      }
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
                      value={profileForm.phone}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          phone: event.target.value
                        }))
                      }
                    />
                  </Field>
                </div>
                <Field label="Location">
                  <Input
                    value={profileForm.location}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        location: event.target.value
                      }))
                    }
                  />
                </Field>
                <Field label="Bio">
                  <textarea
                    rows={4}
                    value={profileForm.bio}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        bio: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink"
                  />
                </Field>
                <div className="flex flex-wrap gap-3">
                  <PrimaryButton
                    onClick={() => profileMutation.mutate(profileForm)}
                    disabled={profileMutation.isPending}
                  >
                    {profileMutation.isPending ? "Saving..." : "Save Changes"}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <div className="text-2xl font-bold text-ink">Account Settings</div>
            <div className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Language">
                  <Select
                    value={preferences.language}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        language: event.target.value
                      }))
                    }
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>German</option>
                  </Select>
                </Field>
                <Field label="Time Zone">
                  <Select
                    value={preferences.timezone}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        timezone: event.target.value
                      }))
                    }
                  >
                    <option>(GMT-05:00) Eastern Time</option>
                    <option>(GMT+00:00) UTC</option>
                    <option>(GMT+05:30) India Standard Time</option>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Date Format">
                  <Select
                    value={preferences.dateFormat}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        dateFormat: event.target.value
                      }))
                    }
                  >
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </Select>
                </Field>
                <Field label="Default Task View">
                  <Select
                    value={preferences.defaultTaskView}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        defaultTaskView: event.target.value
                      }))
                    }
                  >
                    <option value="board">Board</option>
                    <option value="list">List</option>
                  </Select>
                </Field>
              </div>
              <div className="flex flex-wrap gap-3">
                <PrimaryButton
                  onClick={() => preferenceMutation.mutate(preferences)}
                  disabled={preferenceMutation.isPending}
                >
                  {preferenceMutation.isPending ? "Saving..." : "Save Preferences"}
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-xl font-bold text-ink">Your Plan</div>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xl font-bold text-ink">{workspace?.plan || "Pro"} Plan</div>
                <div className="mt-1 text-sm text-soft">
                  You have access to all Pro features.
                </div>
              </div>
            </div>
            {isAdmin ? (
              <PrimaryButton
                className="mt-6 w-full justify-center"
                onClick={() =>
                  workspaceMutation.mutate({
                    ...workspace,
                    plan: workspace?.plan === "pro" ? "enterprise" : "pro"
                  })
                }
              >
                Toggle Plan
              </PrimaryButton>
            ) : null}
          </Card>

          <Card className="p-6">
            <div className="text-xl font-bold text-ink">Preferences</div>
            <div className="mt-5 space-y-5">
              <SettingRow
                icon={LayoutPanelLeft}
                label="Default Task View"
                value={preferences.defaultTaskView}
              />
              <SettingRow
                icon={Globe}
                label="Tasks per page"
                value={String(preferences.tasksPerPage)}
              />
              <SettingRow icon={Palette} label="Theme" value={preferences.theme} />
              <div className="flex items-center justify-between rounded-2xl border border-brand-100 px-4 py-4">
                <div>
                  <div className="font-semibold text-ink">Compact Mode</div>
                  <div className="text-sm text-soft">
                    Show more content in less space.
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreferences((current) => ({
                      ...current,
                      compactMode: !current.compactMode
                    }))
                  }
                  className={`flex h-7 w-12 items-center rounded-full px-1 transition ${
                    preferences.compactMode ? "bg-brand-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow transition ${
                      preferences.compactMode ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-xl font-bold text-ink">Notification Preferences</div>
            <div className="mt-5 space-y-5">
              {preferenceItems.map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Bell className="mt-1 h-4 w-4 text-soft" />
                    <div>
                      <div className="font-semibold text-ink">{item.label}</div>
                      <div className="text-sm text-soft">{item.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setPreferences((current) => ({
                        ...current,
                        notifications: {
                          ...current.notifications,
                          [item.key]: !current.notifications[item.key]
                        }
                      }))
                    }
                    className={`flex h-7 w-12 items-center rounded-full px-1 transition ${
                      preferences.notifications[item.key]
                        ? "bg-brand-500"
                        : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white shadow transition ${
                        preferences.notifications[item.key] ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-rose-100 p-6">
            <div className="text-xl font-bold text-rose-500">Danger Zone</div>
            <div className="mt-3 text-sm text-soft">
              Permanently delete your account and end the current session.
            </div>
            <Input
              className="mt-5"
              value={deleteConfirm}
              onChange={(event) => setDeleteConfirm(event.target.value)}
              placeholder="Type DELETE to confirm"
            />
            {deleteAccountMutation.error ? (
              <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-500">
                {deleteAccountMutation.error.message}
              </div>
            ) : null}
            <button
              className="mt-4 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={deleteConfirm !== "DELETE" || deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              Delete Account
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand-100 px-4 py-4">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-soft" />
        <div className="font-semibold text-ink">{label}</div>
      </div>
      <div className="text-sm text-soft">{value}</div>
    </div>
  );
}
