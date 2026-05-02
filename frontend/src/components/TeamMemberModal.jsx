import { Mail, Phone, Briefcase, MapPin, Calendar, Shield } from "lucide-react";
import {
  Modal,
  Avatar,
  Badge,
  Field,
  Input,
  PrimaryButton,
  SecondaryButton
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
  if (!member) {
    return null;
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

        {/* Actions */}
        <div className="border-t border-brand-100 pt-6 flex gap-3">
          <PrimaryButton className="flex-1" disabled={busy}>
            Send Message
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
