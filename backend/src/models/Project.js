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
      trim: true
    },
    slug: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
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
      enum: ["active", "at-risk", "completed", "archived", "on-hold"],
      default: "active"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    progress: {
      type: Number,
      default: 0
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

export const Project = mongoose.model("Project", projectSchema);
