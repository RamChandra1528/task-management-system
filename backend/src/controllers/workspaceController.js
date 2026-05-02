import { Workspace } from "../models/Workspace.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.user.workspace._id).lean();

  res.json({
    success: true,
    data: workspace
  });
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.user.workspace._id);

  const fields = ["name", "description", "plan", "settings"];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      workspace[field] = req.body[field];
    }
  }

  await workspace.save();

  res.json({
    success: true,
    data: workspace
  });
});
