# Quick Reference: Modal Implementation Examples

## 1. Simple Detail View Modal

```jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import YourDetailModal from "../components/YourDetailModal";
import { PrimaryButton } from "../components/ui";

export default function YourPage() {
  const [selectedId, setSelectedId] = useState("");
  const { data: items } = useQuery({ ... });

  const selectedItem = items.find(i => i._id === selectedId);

  return (
    <>
      {/* List */}
      {items.map(item => (
        <button
          key={item._id}
          onClick={() => setSelectedId(item._id)}
        >
          {item.name}
        </button>
      ))}

      {/* Modal */}
      <YourDetailModal
        open={!!selectedId}
        onClose={() => setSelectedId("")}
        item={selectedItem}
      />
    </>
  );
}
```

## 2. Modal with CRUD Operations

```jsx
<YourDetailModal
  open={!!selectedId}
  onClose={() => setSelectedId("")}
  item={selectedItem}
  onUpdate={(id, payload) => updateMutation.mutate({ id, payload })}
  onDelete={(id) => deleteMutation.mutate(id)}
  busy={updateMutation.isPending || deleteMutation.isPending}
/>
```

## 3. Create/Edit Form Modal

```jsx
const [creating, setCreating] = useState(false);
const [editing, setEditing] = useState(null);

return (
  <>
    <button onClick={() => setCreating(true)}>New Item</button>

    {/* Create Modal */}
    <Modal
      open={creating}
      onClose={() => setCreating(false)}
      title="Create New Item"
    >
      <ItemForm
        onSubmit={(data) => {
          createMutation.mutate(data);
        }}
      />
    </Modal>

    {/* Edit Modal */}
    <Modal
      open={!!editing}
      onClose={() => setEditing(null)}
      title="Edit Item"
    >
      {editing && (
        <ItemForm
          initialData={editing}
          onSubmit={(data) => {
            updateMutation.mutate({ id: editing._id, payload: data });
          }}
        />
      )}
    </Modal>
  </>
);
```

## 4. Using Global Modal State

```jsx
import { useModal } from "../context/ModalContext";

export default function MyPage() {
  const { openModal, closeModal, getModalState } = useModal();
  const { open, data } = getModalState('itemDetail');

  return (
    <>
      {items.map(item => (
        <button
          key={item._id}
          onClick={() => openModal('itemDetail', item)}
        >
          {item.name}
        </button>
      ))}

      <ItemDetailModal
        open={open}
        onClose={() => closeModal('itemDetail')}
        item={data}
      />
    </>
  );
}
```

## 5. Nested Modal (Multiple Modals)

```jsx
const [selectedId, setSelectedId] = useState("");
const [editingId, setEditingId] = useState("");

return (
  <>
    {/* Detail Modal */}
    <ItemDetailModal
      open={!!selectedId}
      onClose={() => setSelectedId("")}
      item={selectedItem}
      onEdit={(item) => setEditingId(item._id)}
    />

    {/* Edit Modal (overlays detail modal) */}
    <Modal
      open={!!editingId}
      onClose={() => setEditingId("")}
      title="Edit Item"
    >
      <ItemForm ... />
    </Modal>
  </>
);
```

## Example: FilesPage

```jsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import FilePreviewModal from "../components/FilePreviewModal";
import { fileApi } from "../lib/api";

export default function FilesPage() {
  const [selectedId, setSelectedId] = useState("");
  const { data: files = [] } = useQuery({
    queryKey: ["files"],
    queryFn: fileApi.list
  });

  const selectedFile = files.find(f => f._id === selectedId);

  const downloadMutation = useMutation({
    mutationFn: fileApi.download
  });

  const deleteMutation = useMutation({
    mutationFn: fileApi.remove,
    onSuccess: () => {
      setSelectedId("");
      queryClient.invalidateQueries({ queryKey: ["files"] });
    }
  });

  return (
    <>
      <div className="grid gap-4">
        {files.map(file => (
          <button
            key={file._id}
            onClick={() => setSelectedId(file._id)}
            className="rounded-2xl border p-4 hover:bg-brand-50"
          >
            📄 {file.name}
          </button>
        ))}
      </div>

      <FilePreviewModal
        open={!!selectedId}
        onClose={() => setSelectedId("")}
        file={selectedFile}
        onDownload={(id) => downloadMutation.mutate(id)}
        onDelete={(id) => deleteMutation.mutate(id)}
        busy={deleteMutation.isPending}
      />
    </>
  );
}
```

## Example: MessagesPage

```jsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MessageDetailModal from "../components/MessageDetailModal";
import { messageApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState("");
  const { data: messages = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: messageApi.list
  });

  const selectedMessage = messages.find(m => m._id === selectedId);

  const replyMutation = useMutation({
    mutationFn: ({ id, payload }) => messageApi.reply(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: messageApi.remove,
    onSuccess: () => {
      setSelectedId("");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
  });

  return (
    <>
      <div className="space-y-3">
        {messages.map(msg => (
          <button
            key={msg._id}
            onClick={() => setSelectedId(msg._id)}
            className="w-full rounded-2xl border p-4 text-left hover:bg-brand-50"
          >
            <div className="font-semibold">{msg.sender?.name}</div>
            <div className="mt-2 line-clamp-2 text-sm text-soft">{msg.text}</div>
          </button>
        ))}
      </div>

      <MessageDetailModal
        open={!!selectedId}
        onClose={() => setSelectedId("")}
        message={selectedMessage}
        currentUser={user}
        onReply={(id, payload) => replyMutation.mutate({ id, payload })}
        onDelete={(id) => deleteMutation.mutate(id)}
        busy={replyMutation.isPending || deleteMutation.isPending}
      />
    </>
  );
}
```

## Common Patterns

### Pattern: Confirmation Modal
```jsx
const [deleteConfirm, setDeleteConfirm] = useState(null);

<Modal
  open={!!deleteConfirm}
  onClose={() => setDeleteConfirm(null)}
  title="Delete Item?"
  subtitle="This action cannot be undone."
>
  <div className="space-y-4">
    <p>Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?</p>
    <div className="flex gap-3">
      <PrimaryButton
        onClick={() => {
          deleteMutation.mutate(deleteConfirm._id);
          setDeleteConfirm(null);
        }}
        className="flex-1"
      >
        Delete
      </PrimaryButton>
      <SecondaryButton
        onClick={() => setDeleteConfirm(null)}
        className="flex-1"
      >
        Cancel
      </SecondaryButton>
    </div>
  </div>
</Modal>
```

### Pattern: Loading Modal
```jsx
<Modal
  open={loading}
  onClose={() => {}}
  title="Processing..."
  size="sm"
>
  <div className="flex flex-col items-center gap-4 py-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
    <p className="text-sm text-soft">Please wait...</p>
  </div>
</Modal>
```

### Pattern: Success Modal
```jsx
<Modal
  open={showSuccess}
  onClose={() => setShowSuccess(false)}
  title="Success! ✨"
  subtitle="Your changes have been saved."
  size="sm"
>
  <div className="flex justify-center py-6">
    <button
      onClick={() => setShowSuccess(false)}
      className="rounded-2xl bg-brand-500 px-6 py-3 font-semibold text-white"
    >
      Great!
    </button>
  </div>
</Modal>
```

## Tips & Tricks

✅ **Always clear selected state on delete**
```jsx
const deleteMutation = useMutation({
  mutationFn: itemApi.remove,
  onSuccess: () => {
    setSelectedId(""); // Close modal
    queryClient.invalidateQueries(...);
  }
});
```

✅ **Pass busy state to disable buttons**
```jsx
<DetailModal
  busy={updateMutation.isPending || deleteMutation.isPending}
  onUpdate={...}
  onDelete={...}
/>
```

✅ **Use size prop appropriately**
- `size="sm"` - Alerts, confirmations
- `size="md"` - Forms, detail views
- `size="lg"` - Rich content, complex forms

✅ **Handle errors gracefully**
```jsx
{error && (
  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
    {error.message}
  </div>
)}
```

✅ **Use subtitle for context**
```jsx
<Modal
  title="Edit Task"
  subtitle="Update task details and settings"
>
```

## Migration Checklist

When updating a page from side panels to modals:

- [ ] Remove side panel component imports
- [ ] Add modal component import
- [ ] Replace `selectedItem && <SidePanel />` with `<Modal open={!!selectedId} />`
- [ ] Update state from `visibleItems[0]` to `items.find(...)`
- [ ] Pass mutation handlers to modal
- [ ] Add `busy` prop to disable during mutations
- [ ] Test all CRUD operations
- [ ] Test responsive behavior
- [ ] Test keyboard shortcuts
- [ ] Verify animations are smooth
