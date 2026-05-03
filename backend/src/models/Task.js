import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    sizeLabel: String,
    type: String,
    url: String
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 180
    },
    description: {
      type: String,
      default: "",
      maxlength: 3000
    },
    status: {
      type: String,
      enum: ["backlog", "todo", "in_progress", "review", "done", "blocked"],
      default: "todo"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    category: {
      type: String,
      default: ""
    },
    sprint: {
      type: String,
      default: ""
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0
    },
    startDate: Date,
    dueDate: Date,
    tags: {
      type: [String],
      default: []
    },
    checklist: {
      type: [checklistItemSchema],
      default: []
    },
    attachments: {
      type: [attachmentSchema],
      default: []
    },
    comments: {
      type: [commentSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

taskSchema.pre("validate", function validateDates(next) {
  if (this.startDate && this.dueDate && this.startDate > this.dueDate) {
    this.invalidate("dueDate", "Task due date must be after the start date");
  }

  next();
});

export const Task = mongoose.model("Task", taskSchema);
