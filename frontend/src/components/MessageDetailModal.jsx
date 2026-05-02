import { Send, Trash2, Reply } from "lucide-react";
import {
  Modal,
  Avatar,
  PrimaryButton,
  TextArea
} from "./ui.jsx";
import { formatDate } from "../lib/utils.js";
import { useState } from "react";

export default function MessageDetailModal({
  open,
  onClose,
  message,
  currentUser,
  onReply,
  onDelete,
  busy = false
}) {
  const [replyText, setReplyText] = useState("");

  if (!message) {
    return null;
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    if (onReply) {
      await onReply(message._id, { text: replyText });
      setReplyText("");
    }
  };

  const isOwner = currentUser?._id === message.sender?._id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Message Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Original Message */}
        <div className="rounded-2xl border border-brand-100 p-6 bg-brand-50/40">
          <div className="flex items-start gap-4">
            <Avatar user={message.sender} size="md" showStatus />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-ink">{message.sender?.name}</div>
                  <div className="text-xs text-soft">{formatDate(message.createdAt)}</div>
                </div>
                {isOwner && onDelete && (
                  <button
                    onClick={() => {
                      onDelete(message._id);
                      onClose();
                    }}
                    disabled={busy}
                    className="rounded-2xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-3 leading-7 text-ink whitespace-pre-wrap">{message.text}</p>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {message.attachments.map((att) => (
                    <div key={att._id} className="flex items-center gap-2 rounded-xl border border-brand-100 px-3 py-2 text-sm">
                      <span>📎</span>
                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline flex-1 truncate">
                        {att.name}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="border-t border-brand-100 pt-4">
            <div className="mb-3 text-xs font-bold uppercase text-soft">Reactions</div>
            <div className="flex flex-wrap gap-2">
              {message.reactions.map((reaction) => (
                <div key={reaction._id} className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm">
                  <span>{reaction.emoji}</span>
                  <span className="font-semibold text-ink">{reaction.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thread/Replies */}
        {message.replies && message.replies.length > 0 && (
          <div className="border-t border-brand-100 pt-6">
            <div className="mb-4 text-sm font-bold uppercase text-soft">{message.replies.length} {message.replies.length === 1 ? "Reply" : "Replies"}</div>
            <div className="space-y-4">
              {message.replies.map((reply) => (
                <div key={reply._id} className="rounded-2xl border border-brand-100 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar user={reply.sender} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-ink">{reply.sender?.name}</div>
                        <div className="text-xs text-soft">{formatDate(reply.createdAt)}</div>
                      </div>
                      <p className="mt-2 text-sm text-ink whitespace-pre-wrap">{reply.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply Input */}
        <div className="border-t border-brand-100 pt-6">
          <div className="mb-3 text-sm font-bold uppercase text-soft">Reply</div>
          <div className="space-y-3">
            <TextArea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              disabled={busy}
            />
            <PrimaryButton
              onClick={handleSubmitReply}
              disabled={!replyText.trim() || busy}
              className="w-full"
            >
              <Send className="h-4 w-4" />
              Send Reply
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
