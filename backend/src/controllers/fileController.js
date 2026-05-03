import path from "node:path";

import { FileAsset } from "../models/FileAsset.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { formatBytes } from "../utils/formatters.js";
import { httpError } from "../utils/httpError.js";
import { optionalArray, optionalRef } from "../utils/payload.js";

const filePopulate = [
  { path: "project", select: "name color" },
  { path: "uploadedBy", select: "name avatar role" },
  { path: "sharedWith", select: "name avatar role" },
  { path: "activity.user", select: "name avatar role" }
];

export const getFiles = asyncHandler(async (req, res) => {
  const files = await FileAsset.find({ workspace: req.user.workspace._id })
    .populate(filePopulate)
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: files
  });
});

export const createFolder = asyncHandler(async (req, res) => {
  const { name, description, project, parentFolder } = req.body;

  if (!name) {
    throw httpError(400, "Folder name is required");
  }

  const folder = await FileAsset.create({
    workspace: req.user.workspace._id,
    project: optionalRef(project),
    uploadedBy: req.user._id,
    name,
    originalName: name,
    mimeType: "inode/directory",
    extension: "",
    kind: "folder",
    description,
    parentFolder: optionalRef(parentFolder),
    sizeBytes: 0,
    sizeLabel: "0 B",
    activity: [
      {
        user: req.user._id,
        action: "created",
        note: "Created the folder"
      }
    ]
  });

  const populatedFolder = await FileAsset.findById(folder._id)
    .populate(filePopulate)
    .lean();

  res.status(201).json({
    success: true,
    data: populatedFolder
  });
});

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw httpError(400, "A file is required");
  }

  const file = await FileAsset.create({
    workspace: req.user.workspace._id,
    project: optionalRef(req.body.project),
    uploadedBy: req.user._id,
    name: req.body.name || req.file.originalname,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    extension: path.extname(req.file.originalname).replace(".", "").toLowerCase(),
    kind: "file",
    description: req.body.description || "",
    parentFolder: optionalRef(req.body.parentFolder),
    sharedWith: req.body.sharedWith ? optionalArray(JSON.parse(req.body.sharedWith)) : [],
    sizeBytes: req.file.size,
    sizeLabel: formatBytes(req.file.size),
    storagePath: req.file.path,
    activity: [
      {
        user: req.user._id,
        action: "uploaded",
        note: "Uploaded the file"
      }
    ]
  });

  const populatedFile = await FileAsset.findById(file._id).populate(filePopulate).lean();

  res.status(201).json({
    success: true,
    data: populatedFile
  });
});

export const updateFile = asyncHandler(async (req, res) => {
  const file = await FileAsset.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!file) {
    throw httpError(404, "File not found");
  }

  const fields = ["name", "description", "sharedWith", "project", "parentFolder"];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      if (["project", "parentFolder"].includes(field)) {
        file[field] = optionalRef(req.body[field]);
      } else if (field === "sharedWith") {
        file[field] = optionalArray(req.body[field]);
      } else {
        file[field] = req.body[field];
      }
    }
  }

  await file.save();

  const populatedFile = await FileAsset.findById(file._id).populate(filePopulate).lean();

  res.json({
    success: true,
    data: populatedFile
  });
});

export const addFileComment = asyncHandler(async (req, res) => {
  if (!req.body.note) {
    throw httpError(400, "Comment text is required");
  }

  const file = await FileAsset.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!file) {
    throw httpError(404, "File not found");
  }

  file.activity.push({
    user: req.user._id,
    action: "commented",
    note: req.body.note
  });

  await file.save();

  const populatedFile = await FileAsset.findById(file._id).populate(filePopulate).lean();

  res.status(201).json({
    success: true,
    data: populatedFile
  });
});

export const downloadFile = asyncHandler(async (req, res) => {
  const file = await FileAsset.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!file) {
    throw httpError(404, "File not found");
  }

  if (!file.storagePath) {
    throw httpError(404, "This seeded file does not have a downloadable asset yet");
  }

  file.downloadCount += 1;
  file.activity.push({
    user: req.user._id,
    action: "downloaded",
    note: "Downloaded the file"
  });
  await file.save();

  res.download(file.storagePath, file.originalName || file.name);
});

export const deleteFile = asyncHandler(async (req, res) => {
  const file = await FileAsset.findOneAndDelete({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!file) {
    throw httpError(404, "File not found");
  }

  res.json({
    success: true,
    message: "File deleted successfully"
  });
});
