import { Modal, PrimaryButton, SecondaryButton } from "./ui.jsx";

export default function FormModal({
  open,
  onClose,
  title,
  subtitle,
  onSubmit,
  children,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  size = "md"
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(event);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size={size}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {children}

        <div className="flex gap-3 pt-4 border-t border-brand-100">
          <PrimaryButton
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Saving..." : submitLabel}
          </PrimaryButton>
          <SecondaryButton
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelLabel}
          </SecondaryButton>
        </div>
      </form>
    </Modal>
  );
}
