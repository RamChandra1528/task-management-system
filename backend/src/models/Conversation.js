import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["direct", "group", "project"],
      default: "group"
    },
    about: {
      type: String,
      default: ""
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);
