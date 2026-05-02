import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  ShieldCheck,
  Users,
  MoreVertical
} from "lucide-react";

import TeamMemberModal from "../components/TeamMemberModal.jsx";
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
  SectionTitle,
  Select,
  SecondaryButton,
  StatCard,
  TextArea
} from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { teamApi, userApi } from "../lib/api.js";
import { cn, formatDate, statusLabel } from "../lib/utils.js";

const memberTabs = [
  { value: "all", label: "All Members" },
  { value: "Development", label: "Developers" },
  { value: "Design", label: "Designers" },
  { value: "Product", label: "Product" },
  { value: "Marketing", label: "Marketing" }
];

export default function TeamPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [memberModal, setMemberModal] = useState({ mode: null, member: null });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.list
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: teamApi.list
  });

  const createUserMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedId(member._id);
      setMemberModal({ mode: null, member: null });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => userApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setMemberModal({ mode: null, member: null });
    }
  });

  const removeUserMutation = useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedId("");
    }
  });

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesTab = activeTab === "all" || user.department === activeTab;
      const haystack = `${user.name} ${user.email} ${user.jobTitle} ${user.department}`;
      const matchesSearch = !search || haystack.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search, users]);

  const selectedUser = users.find((user) => user._id === selectedId) || null;

  if (isLoading) {
    return <LoadingState label="Loading team..." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Team"
        subtitle="Manage your team members and their permissions"
        action={
          <div className="flex flex-wrap gap-3">
            <SecondaryButton>
              <Filter className="h-4 w-4" />
              Filter
            </SecondaryButton>
            {isAdmin ? (
              <PrimaryButton
                onClick={() => setMemberModal({ mode: "create", member: null })}
              >
                <Plus className="h-4 w-4" />
                Invite Member
              </PrimaryButton>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Members" value={users.length} note="Active members" icon={Users} />
        <StatCard
          title="Online Now"
          value={users.filter((user) => user.presence === "online").length}
          note="Members online"
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Teams"
          value={teams.length}
          note="Active teams"
          icon={Users}
          iconClassName="bg-brand-50 text-brand-600"
        />
        <StatCard
          title="Admins"
          value={users.filter((user) => user.role === "admin").length}
          note="Workspace admins"
          icon={ShieldCheck}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-100 px-5 py-4">
          <div className="flex flex-wrap gap-6 text-sm font-semibold text-soft">
            {memberTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "border-b-2 pb-3 transition",
                  activeTab === tab.value
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent hover:text-ink"
                )}
              >
                {tab.label}
                <span className="ml-2">
                  {tab.value === "all"
                    ? users.length
                    : users.filter((user) => user.department === tab.value).length}
                </span>
              </button>
            ))}
          </div>
          <div className="w-full sm:w-[280px]">
            <SearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members..."
            />
          </div>
        </div>

        <div className="hidden grid-cols-[1.5fr_1.1fr_1fr_0.8fr_0.9fr_80px] gap-4 border-b border-brand-100 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 lg:grid">
          <span>Member</span>
          <span>Role</span>
          <span>Team</span>
          <span>Status</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-brand-100">
          {visibleUsers.slice(0, 8).map((member) => (
            <button
              key={member._id}
              onClick={() => setSelectedId(member._id)}
              className="grid w-full gap-4 px-6 py-4 text-left transition lg:grid-cols-[1.5fr_1.1fr_1fr_0.8fr_0.9fr_80px] hover:bg-brand-50/30"
            >
              <div className="flex items-center gap-4">
                <Avatar user={member} size="md" />
                <div className="min-w-0">
                  <div className="font-bold text-ink">{member.name}</div>
                  <div className="truncate text-sm text-soft">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Badge>{member.jobTitle}</Badge>
              </div>
              <div className="text-sm font-medium text-soft">{member.department}</div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    member.presence === "online"
                      ? "bg-emerald-500"
                      : member.presence === "away"
                        ? "bg-amber-500"
                        : "bg-slate-400"
                  )}
                />
                <span
                  className={cn(
                    member.presence === "online"
                      ? "text-emerald-600"
                      : member.presence === "away"
                        ? "text-amber-600"
                        : "text-slate-500"
                  )}
                >
                  {statusLabel(member.presence)}
                </span>
              </div>
              <div className="text-sm text-soft">{formatDate(member.joinedAt)}</div>
              <div className="flex items-center text-soft">
                <MoreVertical className="h-4 w-4" />
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 text-sm text-soft">
          <span>
            Showing 1 to {Math.min(visibleUsers.length, 8)} of {visibleUsers.length} members
          </span>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-2xl border border-brand-100 bg-white">
              <ChevronLeft className="mx-auto h-4 w-4" />
            </button>
            <button className="h-10 w-10 rounded-2xl bg-brand-500 text-white">1</button>
            <button className="h-10 w-10 rounded-2xl border border-brand-100 bg-white">2</button>
            <button className="h-10 w-10 rounded-2xl border border-brand-100 bg-white">
              <ChevronRight className="mx-auto h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Member Detail Modal */}
      <TeamMemberModal
        open={!!selectedId}
        onClose={() => setSelectedId("")}
        member={selectedUser}
        onUpdate={(id, payload) => updateUserMutation.mutate({ id, payload })}
        onRemove={(id) => removeUserMutation.mutate(id)}
        busy={updateUserMutation.isPending || removeUserMutation.isPending}
      />

      {/* Create/Edit Member Modal */}
      <Modal
        open={Boolean(memberModal.mode)}
        onClose={() => setMemberModal({ mode: null, member: null })}
        title={memberModal.mode === "edit" ? "Edit Member" : "Invite Member"}
        subtitle={
          memberModal.mode === "edit"
            ? "Update this teammate's role, team and profile details."
            : "Create a workspace account for a new teammate."
        }
      >
        <MemberForm
          mode={memberModal.mode}
          member={memberModal.member}
          teams={teams}
          saving={createUserMutation.isPending || updateUserMutation.isPending}
          error={createUserMutation.error?.message || updateUserMutation.error?.message}
          onSubmit={(payload) => {
            if (memberModal.mode === "edit") {
              updateUserMutation.mutate({ id: memberModal.member._id, payload });
            } else {
              createUserMutation.mutate(payload);
            }
          }}
          onCancel={() => setMemberModal({ mode: null, member: null })}
        />
      </Modal>
    </div>
  );
}

function MemberForm({ mode, member, teams, saving, error, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: member?.name || "",
    email: member?.email || "",
    password: "",
    role: member?.role || "member",
    team: member?.team?._id || member?.team || teams[0]?._id || "",
    jobTitle: member?.jobTitle || "",
    department: member?.department || teams[0]?.department || "General",
    phone: member?.phone || "",
    location: member?.location || "",
    bio: member?.bio || "",
    presence: member?.presence || "online",
    permissions:
      member?.permissions ||
      ["Project Management", "Task Management", "Reports Access"]
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function togglePermission(permission) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission]
    }));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const payload = { ...form };
        if (mode === "edit") {
          delete payload.password;
        }
        onSubmit(payload);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full Name">
          <Input 
            value={form.name} 
            onChange={(event) => update("name", event.target.value)} 
            required 
            disabled={saving}
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            required
            disabled={saving}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mode !== "edit" ? (
          <Field label="Temporary Password">
            <Input
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              required
              minLength={6}
              disabled={saving}
            />
          </Field>
        ) : null}
        <Field label="Role">
          <Select 
            value={form.role} 
            onChange={(event) => update("role", event.target.value)}
            disabled={saving}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Job Title">
          <Input
            value={form.jobTitle}
            onChange={(event) => update("jobTitle", event.target.value)}
            disabled={saving}
          />
        </Field>
        <Field label="Department">
          <Input
            value={form.department}
            onChange={(event) => update("department", event.target.value)}
            disabled={saving}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Phone">
          <Input
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            disabled={saving}
          />
        </Field>
        <Field label="Location">
          <Input
            value={form.location}
            onChange={(event) => update("location", event.target.value)}
            disabled={saving}
          />
        </Field>
      </div>

      <Field label="Bio">
        <TextArea
          value={form.bio}
          onChange={(event) => update("bio", event.target.value)}
          disabled={saving}
          rows={3}
        />
      </Field>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="border-t border-brand-100 pt-4 flex gap-3">
        <PrimaryButton type="submit" disabled={saving} className="flex-1">
          {saving ? "Saving..." : mode === "edit" ? "Update Member" : "Send Invite"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onCancel} disabled={saving} className="flex-1">
          Cancel
        </SecondaryButton>
      </div>
    </form>
  );
}
