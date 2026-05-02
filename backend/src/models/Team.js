import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
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
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    department: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

teamSchema.index({ workspace: 1, slug: 1 }, { unique: true });

export const Team = mongoose.model("Team", teamSchema);
