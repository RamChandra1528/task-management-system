import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    tags: {
      type: [String],
      default: []
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    color: {
      type: String,
      default: "#7c3aed"
    }
  },
  {
    timestamps: true
  }
);

export const Event = mongoose.model("Event", eventSchema);
