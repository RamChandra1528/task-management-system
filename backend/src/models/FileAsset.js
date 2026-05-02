import mongoose from "mongoose";

const fileActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    action: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const fileAssetSchema = new mongoose.Schema(
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      default: ""
    },
    mimeType: {
      type: String,
      default: "application/octet-stream"
    },
    extension: {
      type: String,
      default: ""
    },
    kind: {
      type: String,
      enum: ["file", "folder"],
      default: "file"
    },
    description: {
      type: String,
      default: ""
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileAsset"
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    sizeBytes: {
      type: Number,
      default: 0
    },
    sizeLabel: {
      type: String,
      default: "0 B"
    },
    storagePath: {
      type: String,
      default: ""
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    iconColor: {
      type: String,
      default: "#7c3aed"
    },
    activity: {
      type: [fileActivitySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const FileAsset = mongoose.model("FileAsset", fileAssetSchema);
