# Team Task Manager - Modal UI Implementation Guide

## Overview
This project uses a **fully modal-based UI** where all detail views and interactions open in centered modal popups instead of side panels. This provides a clean, responsive user experience across all devices.

## Key Features

✅ **Centered Modal Popups** - All detail views open in the center of the screen
✅ **Responsive Design** - 60-80% width on desktop, full width on mobile
✅ **Keyboard Support** - ESC to close, Enter to submit
✅ **Click-Outside Close** - Click background to dismiss
✅ **Smooth Animations** - Scale + fade transitions with framer-motion
✅ **Scrollable Content** - Long content auto-scrolls within modal
✅ **Global State Management** - ModalContext for centralized modal handling

## Architecture

### Core Components

#### 1. Enhanced Modal Component (`ui.jsx`)
Base modal component with:
- Keyboard event handling (ESC to close)
- Click-outside detection
- Smooth animations
- Auto body overflow prevention
- Three sizes: `sm` (max-w-xl), `md` (max-w-2xl), `lg` (max-w-4xl)

```jsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Task Details"
  subtitle="Optional subtitle"
  size="lg"
>
  {/* Modal content */}
</Modal>
```

#### 2. ModalContext (`context/ModalContext.jsx`)
Global modal state management:
```jsx
const { openModal, closeModal, getModalState } = useModal();

// Open modal with data
openModal('taskDetail', taskData);

// Get modal state
const { open, data } = getModalState('taskDetail');

// Close modal
closeModal('taskDetail');
```

#### 3. Detail Modal Components
Specialized modals for each entity type:

- **TaskDetailModal** - View/edit task details, comments, checklist
- **ProjectDetailModal** - Project overview, team members, tasks
- **TeamMemberModal** - User profile, contact info, status
- **FilePreviewModal** - File preview, download, metadata
- **MessageDetailModal** - Message thread, replies, reactions

#### 4. FormModal (Optional)
Reusable wrapper for form-based modals:
```jsx
<FormModal
  open={isOpen}
  onClose={onClose}
  title="Create Task"
  onSubmit={handleSubmit}
  loading={isLoading}
>
  <Field label="Title">
    <Input value={title} onChange={...} />
  </Field>
</FormModal>
```

## Usage Patterns

### Pattern 1: Detail View Modal
```jsx
export default function TasksPage() {
  const [selectedId, setSelectedId] = useState("");
  const { data: tasks } = useQuery({ ... });

  const selectedTask = tasks.find(t => t._id === selectedId);

  return (
    <>
      {/* List view */}
      <div className="space-y-5">
        {tasks.map(task => (
          <button
            key={task._id}
            onClick={() => setSelectedId(task._id)}
          >
            {task.title}
          </button>
        ))}
      </div>

      {/* Modal for detail view */}
      <TaskDetailModal
        open={!!selectedId}
        onClose={() => setSelectedId("")}
        task={selectedTask}
        onUpdate={handleUpdate}
      />
    </>
  );
}
```

### Pattern 2: Create/Edit Form Modal
```jsx
const [creating, setCreating] = useState(false);

return (
  <>
    <button onClick={() => setCreating(true)}>New Task</button>

    <Modal
      open={creating}
      onClose={() => setCreating(false)}
      title="Create New Task"
    >
      <form onSubmit={handleCreate}>
        <Field label="Title">
          <Input value={title} onChange={...} />
        </Field>
        <PrimaryButton type="submit">Create</PrimaryButton>
      </form>
    </Modal>
  </>
);
```

### Pattern 3: Global Modal State
```jsx
import { useModal } from "../context/ModalContext";

export default function TasksList() {
  const { openModal, closeModal, getModalState } = useModal();
  const { open, data } = getModalState('taskDetail');

  return (
    <>
      {tasks.map(task => (
        <button
          key={task._id}
          onClick={() => openModal('taskDetail', task)}
        >
          {task.title}
        </button>
      ))}

      <TaskDetailModal
        open={open}
        onClose={() => closeModal('taskDetail')}
        task={data}
      />
    </>
  );
}
```

## Responsive Behavior

### Mobile (< 640px)
- Modal: 100% width with 16px padding
- Full height with scrollable content
- Touch-friendly buttons

### Tablet (640px - 1024px)
- Modal: 80% width
- Centered on screen
- Optimized spacing

### Desktop (> 1024px)
- Modal: 60-80% width depending on size prop
- Smooth animations
- Hover effects on interactive elements

## Animation Details

### Modal Entry
- Fade: 0 → 1 (opacity)
- Scale: 0.98 → 1
- Y Position: 24px → 0
- Duration: 200ms

### Modal Exit
- Fade: 1 → 0
- Scale: 1 → 0.98
- Y Position: 0 → 16px
- Duration: 150ms

Powered by `framer-motion` AnimatePresence

## Implementing Modals for New Pages

### Step 1: Create Detail Modal Component
```jsx
// components/YourDetailModal.jsx
export default function YourDetailModal({
  open,
  onClose,
  item,
  onUpdate,
  busy
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item?.name}
      size="lg"
    >
      {/* Modal content */}
    </Modal>
  );
}
```

### Step 2: Update Page Component
```jsx
// pages/YourPage.jsx
import YourDetailModal from "../components/YourDetailModal";

export default function YourPage() {
  const [selectedId, setSelectedId] = useState("");
  const { data: items } = useQuery({ ... });

  const selectedItem = items.find(i => i._id === selectedId);

  return (
    <>
      {/* List view */}
      <div>
        {items.map(item => (
          <button
            key={item._id}
            onClick={() => setSelectedId(item._id)}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Detail modal */}
      <YourDetailModal
        open={!!selectedId}
        onClose={() => setSelectedId("")}
        item={selectedItem}
        onUpdate={handleUpdate}
      />
    </>
  );
}
```

### Step 3: Add to QuickCreateModal (AppShell.jsx)
If you have a quick create action:
```jsx
<Modal
  open={open}
  onClose={onClose}
  title="Create New Item"
>
  {/* Create form */}
</Modal>
```

## Keyboard Shortcuts

- **ESC** - Close current modal
- **Enter** - Submit form (in forms)
- **Click outside** - Close modal
- **Tab** - Navigate form fields

## Best Practices

✅ **DO:**
- Use modals for all detail views
- Keep modal content focused and concise
- Use proper heading hierarchy (title, subtitle)
- Provide clear action buttons (Save, Cancel, Delete)
- Handle loading states with disabled buttons
- Use `size="lg"` for content-heavy modals

❌ **DON'T:**
- Use side panels or drawers
- Nest modals (use single modal approach)
- Put too much content in a modal (use tabs/sections)
- Forget keyboard support
- Ignore mobile responsiveness

## Common Issues & Solutions

### Issue: Modal content too small on mobile
**Solution:** Use `size="lg"` and ensure padding inside modal is responsive

### Issue: Form doesn't submit
**Solution:** Make sure form has `onSubmit={handler}` and button has `type="submit"`

### Issue: Animations feel jerky
**Solution:** Check if Tailwind's `soft-scrollbar` class is applied to content

### Issue: Background scroll not prevented
**Solution:** Ensure Modal component's `useEffect` is running (check `open` prop)

## Files to Update

Pages that need modal implementation:
- ✅ TasksPage.jsx (DONE)
- ✅ ProjectsPage.jsx (DONE)
- ⏳ TeamPage.jsx
- ⏳ FilesPage.jsx
- ⏳ MessagesPage.jsx
- ⏳ CalendarPage.jsx
- ⏳ TasksBoardPage.jsx

## Component Exports

All modal components should be exported and available for import:

```jsx
import TaskDetailModal from "../components/TaskDetailModal";
import ProjectDetailModal from "../components/ProjectDetailModal";
import TeamMemberModal from "../components/TeamMemberModal";
import FilePreviewModal from "../components/FilePreviewModal";
import MessageDetailModal from "../components/MessageDetailModal";
import FormModal from "../components/FormModal";
import { Modal, useModal } from "../components/ui";
```

## Testing Checklist

- [ ] Modal opens when item is clicked
- [ ] Modal closes on ESC key
- [ ] Modal closes on background click
- [ ] Modal closes with X button
- [ ] Form submits and updates data
- [ ] Loading state shows during mutation
- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations are smooth
- [ ] Content is scrollable if needed
- [ ] No page scroll when modal is open
- [ ] Keyboard navigation works

## Future Enhancements

- [ ] Add modal stack for multiple modals
- [ ] Implement modal history (browser back button)
- [ ] Add confirm dialogs for destructive actions
- [ ] Add alert/notification modals
- [ ] Implement modal presets (small, medium, large)
- [ ] Add animations to content enter/leave
