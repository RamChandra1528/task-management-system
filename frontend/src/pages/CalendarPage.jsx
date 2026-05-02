import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Flag,
  List,
  Tag,
  Users,
  X
} from "lucide-react";
import {
  addDays,
  differenceInMinutes,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";

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
  SectionTitle,
  SecondaryButton
} from "../components/ui.jsx";
import { eventApi, projectApi, userApi } from "../lib/api.js";
import { cn, formatDate, formatTime, statusLabel } from "../lib/utils.js";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDate(value) {
  return typeof value === "string" ? parseISO(value) : value;
}

function tint(color = "#7c3aed", opacity = "12") {
  return color.startsWith("#") && color.length === 7 ? `${color}${opacity}` : "#f6f1ff";
}

function getMonthDays(month) {
  const firstVisibleDay = startOfWeek(startOfMonth(month));
  return Array.from({ length: 42 }, (_, index) => addDays(firstVisibleDay, index));
}

function durationLabel(event) {
  if (!event?.start || !event?.end) return "";
  const minutes = Math.max(0, differenceInMinutes(toDate(event.end), toDate(event.start)));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState("");
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [eventModal, setEventModal] = useState({ mode: null, event: null });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: eventApi.list
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.list
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.list
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? eventApi.update(id, payload) : eventApi.create(payload),
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setSelectedId(event._id);
      setEventModal({ mode: null, event: null });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: eventApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setSelectedId("");
    }
  });

  const monthDays = useMemo(() => getMonthDays(displayMonth), [displayMonth]);
  const selectedEvent =
    events.find((event) => event._id === selectedId) ||
    events.find((event) => isSameDay(toDate(event.start), new Date())) ||
    events[0] ||
    null;

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((event) => toDate(event.start) >= new Date())
        .slice(0, 4),
    [events]
  );

  if (isLoading) {
    return <LoadingState label="Loading calendar..." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Calendar"
        subtitle="View and manage your schedule and deadlines"
      />

      <div className="grid gap-6 xl:grid-cols-[1.8fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <SecondaryButton>Today</SecondaryButton>
            <div className="flex overflow-hidden rounded-2xl border border-brand-100 bg-white">
              <button className="border-r border-brand-100 px-4 py-3 text-soft">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="px-4 py-3 text-soft">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <SecondaryButton>
              May 2025
              <ChevronRight className="h-4 w-4 rotate-90" />
            </SecondaryButton>
            <div className="ml-auto flex items-center gap-3">
              <SecondaryButton>
                <Filter className="h-4 w-4" />
                Filter
              </SecondaryButton>
              <SecondaryButton>
                Month
                <ChevronRight className="h-4 w-4 rotate-90" />
              </SecondaryButton>
              <PrimaryButton onClick={() => setEventModal({ mode: "create", event: null })}>
                Add Event
              </PrimaryButton>
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-7 border-b border-brand-100 bg-white">
              {weekdays.map((day) => (
                <div key={day} className="px-4 py-5 text-center text-sm font-bold text-ink">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const dayEvents = events.filter((event) => isSameDay(toDate(event.start), day));
                const isSelectedDay =
                  selectedEvent && isSameDay(toDate(selectedEvent.start), day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[134px] border-r border-t border-brand-100 p-3 last:border-r-0",
                      !isSameMonth(day, displayMonth) && "text-slate-400",
                      isSelectedDay && "bg-brand-50/30 ring-1 ring-inset ring-brand-300"
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        isSameMonth(day, displayMonth) ? "text-ink" : "text-slate-400"
                      )}
                    >
                      {format(day, isSameMonth(day, displayMonth) ? "d" : "d")}
                    </div>
                    <div className="mt-3 space-y-2">
                      {dayEvents.slice(0, 2).map((event) => {
                        const color = event.color || event.project?.color || "#7c3aed";
                        return (
                          <button
                            key={event._id}
                            onClick={() => setSelectedId(event._id)}
                            className="w-full rounded-xl px-3 py-2 text-left text-xs transition hover:-translate-y-0.5"
                            style={{ backgroundColor: tint(color, "14") }}
                          >
                            <div className="flex items-start gap-2 font-bold text-ink">
                              <span
                                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span className="line-clamp-2">{event.title}</span>
                            </div>
                            <div className="mt-1 pl-4 text-soft">{formatTime(event.start)}</div>
                          </button>
                        );
                      })}
                      {dayEvents.length > 2 ? (
                        <div className="text-xs font-semibold text-brand-500">
                          +{dayEvents.length - 2} more
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedEvent ? (
            <Card className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: selectedEvent.color || "#7c3aed" }}
                  />
                  <h3 className="text-2xl font-bold text-ink">{selectedEvent.title}</h3>
                </div>
                <button className="text-soft">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-5 text-sm">
                <DetailRow
                  icon={CalendarDays}
                  value={formatDate(selectedEvent.start, "EEEE, MMM d, yyyy")}
                />
                <DetailRow
                  icon={Clock3}
                  value={`${formatTime(selectedEvent.start)} - ${formatTime(
                    selectedEvent.end
                  )} (${durationLabel(selectedEvent)})`}
                />
                <DetailRow
                  icon={Users}
                  value={
                    <AvatarGroup
                      users={selectedEvent.attendees || []}
                      extraLabel={
                        selectedEvent.attendees?.length > 3
                          ? `+${selectedEvent.attendees.length - 3}`
                          : ""
                      }
                    />
                  }
                />
                <DetailRow
                  icon={Flag}
                  value={
                    <Badge tone={selectedEvent.priority}>
                      {statusLabel(selectedEvent.priority)} Priority
                    </Badge>
                  }
                />
                <DetailRow
                  icon={Tag}
                  value={
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.tags?.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  }
                />
                <DetailRow icon={List} value={selectedEvent.description} alignStart />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <PrimaryButton
                  className="justify-center"
                  onClick={() => setEventModal({ mode: "edit", event: selectedEvent })}
                >
                  Edit Event
                </PrimaryButton>
                <SecondaryButton
                  className="justify-center"
                  onClick={() => deleteMutation.mutate(selectedEvent._id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </SecondaryButton>
              </div>
            </Card>
          ) : null}

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-ink">May 2025</div>
              <div className="flex gap-2 text-soft">
                <ChevronLeft className="h-5 w-5" />
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-2 text-center text-sm">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="font-semibold text-soft">
                  {day}
                </div>
              ))}
              {monthDays.slice(0, 35).map((day) => {
                const selected = isSameDay(day, new Date(2025, 4, 12));
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "grid h-9 place-items-center rounded-full text-sm font-semibold",
                      selected
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                        : isSameMonth(day, displayMonth)
                          ? "text-ink"
                          : "text-slate-400"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-ink">Upcoming Events</div>
              <ActionLink>View All</ActionLink>
            </div>
            <div className="mt-5 space-y-5">
              {upcomingEvents.map((event) => (
                <button
                  key={event._id}
                  onClick={() => setSelectedId(event._id)}
                  className="flex w-full items-start gap-4 text-left"
                >
                  <span
                    className="mt-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: event.color || "#7c3aed" }}
                  />
                  <div>
                    <div className="font-semibold text-ink">{event.title}</div>
                    <div className="mt-1 text-sm text-soft">
                      {formatDate(event.start)} - {formatTime(event.start)} -{" "}
                      {formatTime(event.end)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              className="mt-6 w-full rounded-2xl border border-brand-100 px-4 py-3 text-sm font-semibold text-brand-500"
              onClick={() => setEventModal({ mode: "create", event: null })}
            >
              + Add Event
            </button>
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(eventModal.mode)}
        onClose={() => setEventModal({ mode: null, event: null })}
        title={eventModal.mode === "edit" ? "Edit Event" : "Add Event"}
        subtitle="Schedule work with project context, attendees and priority."
      >
        <EventForm
          event={eventModal.event}
          projects={projects}
          users={users}
          saving={saveMutation.isPending}
          error={saveMutation.error?.message}
          onSubmit={(payload) =>
            saveMutation.mutate({
              id: eventModal.event?._id,
              payload
            })
          }
        />
      </Modal>
    </div>
  );
}

function DetailRow({ icon: Icon, value, alignStart = false }) {
  return (
    <div className={cn("flex gap-4", alignStart ? "items-start" : "items-center")}>
      <Icon className="h-5 w-5 shrink-0 text-soft" />
      <div className="min-w-0 font-medium text-ink">{value}</div>
    </div>
  );
}

function toLocalInputValue(value) {
  if (!value) return "";
  const date = toDate(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function EventForm({ event, projects, users, saving, error, onSubmit }) {
  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    project: event?.project?._id || event?.project || "",
    attendees: event?.attendees?.map((attendee) => attendee._id || attendee) || [],
    priority: event?.priority || "medium",
    tags: event?.tags?.join(", ") || "",
    color: event?.color || event?.project?.color || "#7c3aed",
    start: toLocalInputValue(event?.start),
    end: toLocalInputValue(event?.end)
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(submitEvent) => {
        submitEvent.preventDefault();
        onSubmit({
          ...form,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        });
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Title">
          <Input value={form.title} onChange={(event) => update("title", event.target.value)} required />
        </Field>
        <Field label="Priority">
          <select
            value={form.priority}
            onChange={(event) => update("priority", event.target.value)}
            className="w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Start">
          <Input
            type="datetime-local"
            value={form.start}
            onChange={(event) => update("start", event.target.value)}
            required
          />
        </Field>
        <Field label="End">
          <Input
            type="datetime-local"
            value={form.end}
            onChange={(event) => update("end", event.target.value)}
            required
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Project">
          <select
            value={form.project}
            onChange={(event) => {
              const project = projects.find((item) => item._id === event.target.value);
              update("project", event.target.value);
              update("color", project?.color || form.color);
            }}
            className="w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Color">
          <Input type="color" value={form.color} onChange={(event) => update("color", event.target.value)} />
        </Field>
      </div>

      <Field label="Attendees">
        <select
          value=""
          onChange={(event) => {
            const value = event.target.value;
            if (!value) return;
            update(
              "attendees",
              form.attendees.includes(value) ? form.attendees : [...form.attendees, value]
            );
          }}
          className="w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink"
        >
          <option value="">Add attendee</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
        <div className="mt-3 flex flex-wrap gap-2">
          {form.attendees.map((id) => {
            const person = users.find((user) => user._id === id);
            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  update(
                    "attendees",
                    form.attendees.filter((entry) => entry !== id)
                  )
                }
                className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600"
              >
                {person?.name || "Attendee"} x
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Tags">
        <Input value={form.tags} onChange={(event) => update("tags", event.target.value)} />
      </Field>

      <Field label="Description">
        <Input value={form.description} onChange={(event) => update("description", event.target.value)} />
      </Field>

      {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-500">{error}</div> : null}

      <div className="flex justify-end">
        <PrimaryButton type="submit" disabled={saving}>
          {saving ? "Saving..." : event ? "Save Event" : "Create Event"}
        </PrimaryButton>
      </div>
    </form>
  );
}
