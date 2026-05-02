import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    emoji: String,
    count: {
      type: Number,
      default: 1
    }
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    sizeLabel: String,
    type: String
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    body: {
      type: String,
      required: true
    },
    attachments: {
      type: [attachmentSchema],
      default: []
    },
    reactions: {
      type: [reactionSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const Message = mongoose.model("Message", messageSchema);
