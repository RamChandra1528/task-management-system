import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AtSign,
  Download,
  FileText,
  Filter,
  Info,
  Paperclip,
  PencilLine,
  Phone,
  Search,
  Send,
  Smile,
  Star,
  Users,
  Video
} from "lucide-react";

import {
  ActionLink,
  Avatar,
  AvatarGroup,
  Card,
  Field,
  Input,
  LoadingState,
  Modal,
  PrimaryButton,
  SectionTitle,
  Select,
  SecondaryButton
} from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { messageApi, projectApi, userApi } from "../lib/api.js";
import { cn, formatDate, formatTime, relativeToReference } from "../lib/utils.js";

const conversationTabs = ["All", "Direct", "Groups", "Mentions"];

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const [body, setBody] = useState("");
  const [conversationModalOpen, setConversationModalOpen] = useState(false);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: messageApi.list
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.list
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.list
  });

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      if (activeTab === "All") return true;
      if (activeTab === "Direct") return conversation.type === "direct";
      if (activeTab === "Groups") return conversation.type !== "direct";
      return conversation.lastMessage?.body?.toLowerCase().includes(user?.name?.toLowerCase() || "");
    });
  }, [activeTab, conversations, user?.name]);

  const selectedConversation =
    conversations.find((conversation) => conversation._id === selectedId) ||
    conversations.find((conversation) => conversation.name === "Design Team") ||
    conversations[0] ||
    null;

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["conversation", selectedConversation?._id],
    queryFn: () => messageApi.detail(selectedConversation._id),
    enabled: Boolean(selectedConversation?._id)
  });

  const sendMutation = useMutation({
    mutationFn: ({ id, payload }) => messageApi.send(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", selectedConversation?._id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setBody("");
    }
  });

  const createConversationMutation = useMutation({
    mutationFn: messageApi.createConversation,
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedId(newConversation._id);
      setConversationModalOpen(false);
    }
  });

  if (isLoading) {
    return <LoadingState label="Loading messages..." />;
  }

  const conversation = detail?.conversation || selectedConversation;
  const messages = detail?.messages || [];

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Messages"
        subtitle="Communicate with your team in real time"
        action={
          <div className="flex flex-wrap gap-3">
            <SecondaryButton>
              <Search className="h-4 w-4" />
            </SecondaryButton>
            <SecondaryButton>
              <Filter className="h-4 w-4" />
            </SecondaryButton>
            <PrimaryButton icon={PencilLine} onClick={() => setConversationModalOpen(true)}>
              New Message
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.6fr_0.72fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex gap-8 border-b border-brand-100 px-6 pt-5 text-sm font-semibold text-soft">
            {conversationTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "border-b-2 pb-4 transition",
                  activeTab === tab
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent hover:text-ink"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="divide-y divide-brand-100">
            {filteredConversations.map((item, index) => (
              <button
                key={item._id}
                onClick={() => setSelectedId(item._id)}
                className={cn(
                  "flex w-full items-start gap-4 px-6 py-5 text-left transition",
                  conversation?._id === item._id ? "bg-brand-50/70" : "hover:bg-brand-50/30"
                )}
              >
                {item.type === "direct" ? (
                  <Avatar user={item.members?.find((member) => member._id !== user?._id)} size="lg" />
                ) : (
                  <AvatarGroup users={item.members || []} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate font-bold text-ink">{item.name}</div>
                    <div className="shrink-0 text-xs text-soft">
                      {item.lastMessageAt
                        ? formatTime(item.lastMessageAt)
                        : relativeToReference(item.updatedAt)}
                    </div>
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm leading-6 text-soft">
                    {item.lastMessage?.sender?.name}: {item.lastMessage?.body || item.about}
                  </div>
                </div>
                {index < 2 ? (
                  <span className="grid h-7 min-w-[28px] place-items-center rounded-full bg-brand-500 px-2 text-xs font-bold text-white">
                    {index === 0 ? 2 : 1}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <button className="w-full px-6 py-5 text-sm font-semibold text-brand-500">
            Show more
          </button>
        </Card>

        <Card className="flex min-h-[760px] flex-col overflow-hidden p-0">
          {conversation ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-100 px-6 py-5">
                <div className="flex items-center gap-4">
                  <AvatarGroup users={conversation.members || []} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-ink">{conversation.name}</h3>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="mt-1 text-sm text-soft">
                      {conversation.members?.length || 0} members
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <SecondaryButton>
                    <Phone className="h-4 w-4" />
                  </SecondaryButton>
                  <SecondaryButton>
                    <Video className="h-4 w-4" />
                  </SecondaryButton>
                  <SecondaryButton>
                    <Info className="h-4 w-4" />
                  </SecondaryButton>
                </div>
              </div>

              <div className="soft-scrollbar flex-1 overflow-y-auto px-6 py-6">
                {detailLoading ? (
                  <LoadingState label="Opening conversation..." />
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-soft">
                        Today
                      </span>
                    </div>

                    {messages.map((message) => {
                      const isOwnMessage = message.sender?._id === user?._id;
                      return (
                        <div
                          key={message._id}
                          className={cn("flex gap-4", isOwnMessage && "justify-end")}
                        >
                          {!isOwnMessage ? <Avatar user={message.sender} size="md" /> : null}
                          <div className={cn("max-w-[72%]", isOwnMessage && "text-right")}>
                            <div
                              className={cn(
                                "mb-2 flex items-center gap-2 text-sm",
                                isOwnMessage ? "justify-end" : "justify-start"
                              )}
                            >
                              {!isOwnMessage ? (
                                <span className="font-bold text-ink">{message.sender?.name}</span>
                              ) : null}
                              <span className="text-soft">{formatTime(message.createdAt)}</span>
                            </div>
                            <div
                              className={cn(
                                "rounded-2xl px-5 py-4 text-sm leading-7 shadow-sm",
                                isOwnMessage
                                  ? "bg-gradient-to-r from-brand-600 to-brand-400 text-white"
                                  : "bg-slate-100 text-ink"
                              )}
                            >
                              {message.body}
                              {message.attachments?.map((attachment) => (
                                <div
                                  key={attachment.name}
                                  className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 text-ink"
                                >
                                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-500">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1 text-left">
                                    <div className="truncate font-semibold">{attachment.name}</div>
                                    <div className="text-xs text-soft">
                                      {attachment.type?.toUpperCase()} File - {attachment.sizeLabel}
                                    </div>
                                  </div>
                                  <Download className="h-4 w-4 text-soft" />
                                </div>
                              ))}
                            </div>
                            {message.reactions?.length ? (
                              <div className="mt-2 inline-flex rounded-full border border-brand-100 bg-white px-3 py-1 text-sm text-soft">
                                Like {message.reactions[0].count}
                              </div>
                            ) : null}
                          </div>
                          {isOwnMessage ? <Avatar user={message.sender} size="md" /> : null}
                        </div>
                      );
                    })}

                    <div className="flex items-center gap-3 text-sm text-soft">
                      <span className="rounded-full bg-slate-100 px-3 py-2">...</span>
                      Olivia Rhye is typing...
                    </div>
                  </div>
                )}
              </div>

              <form
                className="m-6 mt-0 rounded-2xl border border-brand-100 bg-white px-4 py-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!body.trim() || !conversation?._id) return;
                  sendMutation.mutate({
                    id: conversation._id,
                    payload: { body }
                  });
                }}
              >
                <Input
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Type a message..."
                  className="border-none px-0 shadow-none focus:ring-0"
                />
                <div className="mt-3 flex items-center gap-4 text-soft">
                  <Paperclip className="h-5 w-5" />
                  <Smile className="h-5 w-5" />
                  <AtSign className="h-5 w-5" />
                  <FileText className="h-5 w-5" />
                  <button
                    type="submit"
                    className="ml-auto grid h-11 w-11 place-items-center rounded-full bg-brand-500 text-white"
                    disabled={sendMutation.isPending}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <LoadingState label="Choose a conversation." />
          )}
        </Card>

        {conversation ? <ConversationPanel conversation={conversation} user={user} /> : null}
      </div>

      <Modal
        open={conversationModalOpen}
        onClose={() => setConversationModalOpen(false)}
        title="New Message"
        subtitle="Start a real direct, group, or project conversation."
      >
        <ConversationForm
          users={users.filter((person) => person._id !== user?._id)}
          projects={projects}
          saving={createConversationMutation.isPending}
          error={createConversationMutation.error?.message}
          onSubmit={(payload) => createConversationMutation.mutate(payload)}
        />
      </Modal>
    </div>
  );
}

function ConversationPanel({ conversation, user }) {
  return (
    <Card className="p-6">
      <div className="font-bold text-ink">About</div>
      <div className="mt-6 flex items-center gap-4">
        <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-brand-50 text-brand-500">
          <Users className="h-9 w-9" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-xl font-bold text-ink">
            {conversation.name}
            <PencilLine className="h-4 w-4 text-brand-500" />
          </div>
          <div className="mt-1 text-sm text-soft">
            {conversation.members?.length || 0} members
          </div>
        </div>
      </div>
      <p className="mt-6 border-b border-brand-100 pb-6 text-sm leading-7 text-soft">
        {conversation.about}
      </p>

      <div className="space-y-4 border-b border-brand-100 py-6 text-sm">
        <InfoLine label="Created by" value={conversation.createdBy?.name || "Emma Johnson"} />
        <InfoLine label="Created on" value={formatDate(conversation.createdAt)} />
        <InfoLine label="Type" value={conversation.type} />
      </div>

      <div className="py-6">
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink">Members ({conversation.members?.length || 0})</div>
          <ActionLink>Add Members</ActionLink>
        </div>
        <div className="mt-5 space-y-4">
          {conversation.members?.map((member) => (
            <div key={member._id} className="flex items-center gap-3">
              <Avatar user={member} size="md" showStatus />
              <div className="min-w-0">
                <div className="truncate font-bold text-ink">
                  {member.name}
                  {member._id === user?._id ? " (You)" : ""}
                </div>
                <div className="text-sm text-soft">{member.jobTitle}</div>
              </div>
              <span
                className={cn(
                  "ml-auto h-2 w-2 rounded-full",
                  member.presence === "online"
                    ? "bg-emerald-500"
                    : member.presence === "away"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <SecondaryButton className="w-full justify-center text-rose-500">
        Leave Channel
      </SecondaryButton>
    </Card>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-soft">{label}</span>
      <span className="font-semibold capitalize text-ink">{value}</span>
    </div>
  );
}

function ConversationForm({ users, projects, saving, error, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    type: "group",
    about: "",
    project: "",
    members: []
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...form,
          project: form.project || undefined
        });
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Conversation Name">
          <Input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            required
          />
        </Field>
        <Field label="Type">
          <Select value={form.type} onChange={(event) => update("type", event.target.value)}>
            <option value="group">Group</option>
            <option value="direct">Direct</option>
            <option value="project">Project</option>
          </Select>
        </Field>
      </div>

      <Field label="Project">
        <Select value={form.project} onChange={(event) => update("project", event.target.value)}>
          <option value="">No project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Members">
        <Select
          value=""
          onChange={(event) => {
            const value = event.target.value;
            if (!value) return;
            update("members", form.members.includes(value) ? form.members : [...form.members, value]);
          }}
        >
          <option value="">Add member</option>
          {users.map((person) => (
            <option key={person._id} value={person._id}>
              {person.name}
            </option>
          ))}
        </Select>
        <div className="mt-3 flex flex-wrap gap-2">
          {form.members.map((id) => {
            const person = users.find((user) => user._id === id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => update("members", form.members.filter((member) => member !== id))}
                className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600"
              >
                {person?.name || "Member"} x
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="About">
        <Input
          value={form.about}
          onChange={(event) => update("about", event.target.value)}
          placeholder="What is this conversation for?"
        />
      </Field>

      {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-500">{error}</div> : null}

      <div className="flex justify-end">
        <PrimaryButton type="submit" disabled={saving || form.members.length === 0}>
          {saving ? "Creating..." : "Create Conversation"}
        </PrimaryButton>
      </div>
    </form>
  );
}
