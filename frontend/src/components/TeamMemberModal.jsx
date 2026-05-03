import { useEffect, useState } from "react";
import { Mail, Phone, Briefcase, MapPin, Calendar, Shield } from "lucide-react";
import {
  Modal,
  Avatar,
  Badge,
  Field,
  Input,
  PrimaryButton,
  SecondaryButton,
  Select
} from "./ui.jsx";
import { formatDate } from "../lib/utils.js";

export default function TeamMemberModal({
  open,
  onClose,
  member,
  onUpdate,
  onRemove,
  busy = false
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    jobTitle: "",
    department: "General",
    role: "member",
    presence: "offline",
    phone: "",
    location: ""
  });

  useEffect(() => {
    if (!member) return;
    setForm({
      name: member.name || "",
      email: member.email || "",
      jobTitle: member.jobTitle || "",
      department: member.department || "General",
      role: member.role || "member",
      presence: member.presence || "offline",
      phone: member.phone || "",
      location: member.location || ""
    });
    setEditing(false);
  }, [member]);

  if (!member) {
    return null;
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={member.name}
      subtitle={member.jobTitle}
      size="md"
    >
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex justify-center">
          <Avatar user={member} size="xl" showStatus />
        </div>

        {editing ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              onUpdate(member._id, form);
              setEditing(false);
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <Input value={form.name} onChange={(event) => update("name", event.target.value)} disabled={busy} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} disabled={busy} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Job Title">
                <Input value={form.jobTitle} onChange={(event) => update("jobTitle", event.target.value)} disabled={busy} />
              </Field>
              <Field label="Department">
                <Input value={form.department} onChange={(event) => update("department", event.target.value)} disabled={busy} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Role">
                <Select value={form.role} onChange={(event) => update("role", event.target.value)} disabled={busy}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>
              <Field label="Presence">
                <Select value={form.presence} onChange={(event) => update("presence", event.target.value)} disabled={busy}>
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="offline">Offline</option>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phone">
                <Input value={form.phone} onChange={(event) => update("phone", event.target.value)} disabled={busy} />
              </Field>
              <Field label="Location">
                <Input value={form.location} onChange={(event) => update("location", event.target.value)} disabled={busy} />
              </Field>
            </div>
            <div className="flex gap-3">
              <PrimaryButton type="submit" className="flex-1" disabled={busy}>
                Save Member
              </PrimaryButton>
              <SecondaryButton type="button" className="flex-1" onClick={() => setEditing(false)} disabled={busy}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        ) : (
          <>
            {/* Member Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3">
                <Mail className="h-4 w-4 text-brand-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-soft">Email</div>
                  <div className="font-semibold text-ink truncate">{member.email}</div>
                </div>
              </div>

              {member.phone && (
                <div className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3">
                  <Phone className="h-4 w-4 text-brand-600" />
                  <div className="flex-1">
                    <div className="text-xs text-soft">Phone</div>
                    <div className="font-semibold text-ink">{member.phone}</div>
                  </div>
                </div>
              )}

              {member.jobTitle && (
                <div className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3">
                  <Briefcase className="h-4 w-4 text-brand-600" />
                  <div className="flex-1">
                    <div className="text-xs text-soft">Job Title</div>
                    <div className="font-semibold text-ink">{member.jobTitle}</div>
                  </div>
                </div>
              )}

              {member.department && (
                <div className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3">
                  <Shield className="h-4 w-4 text-brand-600" />
                  <div className="flex-1">
                    <div className="text-xs text-soft">Department</div>
                    <div className="font-semibold text-ink">{member.department}</div>
                  </div>
                </div>
              )}

              {member.location && (
                <div className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3">
                  <MapPin className="h-4 w-4 text-brand-600" />
                  <div className="flex-1">
                    <div className="text-xs text-soft">Location</div>
                    <div className="font-semibold text-ink">{member.location}</div>
                  </div>
                </div>
              )}

              {member.joinedDate && (
                <div className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3">
                  <Calendar className="h-4 w-4 text-brand-600" />
                  <div className="flex-1">
                    <div className="text-xs text-soft">Joined</div>
                    <div className="font-semibold text-ink">{formatDate(member.joinedDate)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Role & Status */}
            <div className="border-t border-brand-100 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Role">
                  <div className="flex items-center justify-between rounded-2xl border border-brand-100 px-4 py-3">
                    <Badge tone={member.role}>{member.role || "Member"}</Badge>
                  </div>
                </Field>
                <Field label="Status">
                  <div className="flex items-center justify-between rounded-2xl border border-brand-100 px-4 py-3">
                    <Badge
                      tone={
                        member.presence === "online"
                          ? "active"
                          : member.presence === "away"
                            ? "pending"
                            : "inactive"
                      }
                    >
                      {member.presence || "offline"}
                    </Badge>
                  </div>
                </Field>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="border-t border-brand-100 pt-6 flex gap-3">
          <PrimaryButton className="flex-1" disabled={busy} onClick={() => setEditing(true)}>
            Edit Member
          </PrimaryButton>
          {onRemove && (
            <button
              onClick={() => {
                onRemove(member._id);
                onClose();
              }}
              disabled={busy}
              className="rounded-2xl border border-rose-200 px-5 py-3 font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
