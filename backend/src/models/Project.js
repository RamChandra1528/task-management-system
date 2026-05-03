import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: "",
      maxlength: 2000
    },
    color: {
      type: String,
      default: "#7c3aed"
    },
    icon: {
      type: String,
      default: "sparkles"
    },
    status: {
      type: String,
      enum: ["planning", "active", "at-risk", "completed", "archived", "on-hold"],
      default: "active"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    startDate: Date,
    dueDate: Date,
    category: {
      type: String,
      default: ""
    },
    tags: {
      type: [String],
      default: []
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
      }
    ],
    archivedAt: Date
  },
  {
    timestamps: true
  }
);

projectSchema.index({ workspace: 1, slug: 1 }, { unique: true });

projectSchema.pre("validate", function validateDates(next) {
  if (this.startDate && this.dueDate && this.startDate > this.dueDate) {
    this.invalidate("dueDate", "Project due date must be after the start date");
  }

  next();
});

export const Project = mongoose.model("Project", projectSchema);
