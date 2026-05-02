import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      default: ""
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "pro"
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    settings: {
      defaultTaskView: {
        type: String,
        enum: ["board", "list"],
        default: "board"
      },
      tasksPerPage: {
        type: Number,
        default: 25
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light"
      },
      compactMode: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true
  }
);

export const Workspace = mongoose.model("Workspace", workspaceSchema);
