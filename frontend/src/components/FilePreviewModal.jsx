import { Download, Trash2, Eye, File } from "lucide-react";
import {
  Modal,
  Badge,
  PrimaryButton,
  SecondaryButton
} from "./ui.jsx";
import { formatDate } from "../lib/utils.js";

const fileTypeIcons = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  xls: "📊",
  xlsx: "📊",
  ppt: "📽️",
  pptx: "📽️",
  jpg: "🖼️",
  jpeg: "🖼️",
  png: "🖼️",
  gif: "🖼️",
  zip: "🗂️",
  rar: "🗂️",
  txt: "📄",
  csv: "📊"
};

export default function FilePreviewModal({
  open,
  onClose,
  file,
  onDownload,
  onDelete,
  busy = false
}) {
  if (!file) {
    return null;
  }

  const fileExtension = file.name?.split(".").pop()?.toLowerCase() || "file";
  const icon = fileTypeIcons[fileExtension] || "📦";
  const fileSize = formatFileSize(file.size);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={file.name}
      subtitle={`${fileSize} • ${formatDate(file.uploadedAt)}`}
      size="md"
    >
      <div className="space-y-6">
        {/* File Preview */}
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-100 bg-brand-50 py-12">
          {isImageFile(file.name) && file.url ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-h-64 max-w-full rounded-xl object-contain"
            />
          ) : (
            <>
              <div className="text-6xl mb-4">{icon}</div>
              <div className="text-center">
                <div className="font-semibold text-ink">{fileExtension.toUpperCase()}</div>
                <div className="text-sm text-soft">{fileSize}</div>
              </div>
            </>
          )}
        </div>

        {/* File Details */}
        <div className="space-y-3 border-t border-brand-100 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-soft">Type</span>
            <Badge>{fileExtension.toUpperCase()}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-soft">Size</span>
            <span className="font-semibold text-ink">{fileSize}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-soft">Uploaded</span>
            <span className="font-semibold text-ink">{formatDate(file.uploadedAt)}</span>
          </div>
          {file.uploadedBy && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-soft">Uploaded By</span>
              <span className="font-semibold text-ink">{file.uploadedBy.name}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-brand-100 pt-6 flex gap-3">
          <PrimaryButton
            onClick={() => onDownload(file._id)}
            disabled={busy}
            className="flex-1"
          >
            <Download className="h-4 w-4" />
            Download
          </PrimaryButton>
          {onDelete && (
            <button
              onClick={() => {
                onDelete(file._id);
                onClose();
              }}
              disabled={busy}
              className="rounded-2xl border border-rose-200 px-5 py-3 font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function isImageFile(filename) {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const ext = filename?.split(".").pop()?.toLowerCase() || "";
  return imageExtensions.includes(ext);
}
