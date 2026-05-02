import { Team } from "../models/Team.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { slugify } from "../utils/slugify.js";

export const getTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ workspace: req.user.workspace._id })
    .populate("lead")
    .sort({ name: 1 })
    .lean();

  const teamsWithCounts = await Promise.all(
    teams.map(async (team) => ({
      ...team,
      memberCount: await User.countDocuments({ team: team._id })
    }))
  );

  res.json({
    success: true,
    data: teamsWithCounts
  });
});

export const createTeam = asyncHandler(async (req, res) => {
  const { name, description, color, lead, department } = req.body;

  if (!name) {
    throw httpError(400, "Team name is required");
  }

  const team = await Team.create({
    workspace: req.user.workspace._id,
    name,
    slug: slugify(name),
    description,
    color,
    lead,
    department
  });

  const populatedTeam = await Team.findById(team._id).populate("lead").lean();

  res.status(201).json({
    success: true,
    data: populatedTeam
  });
});

export const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!team) {
    throw httpError(404, "Team not found");
  }

  const fields = ["name", "description", "color", "lead", "department", "status"];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      team[field] = req.body[field];
    }
  }

  if (req.body.name) {
    team.slug = slugify(req.body.name);
  }

  await team.save();

  const populatedTeam = await Team.findById(team._id).populate("lead").lean();

  res.json({
    success: true,
    data: populatedTeam
  });
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findOneAndDelete({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!team) {
    throw httpError(404, "Team not found");
  }

  await User.updateMany(
    { team: team._id, workspace: req.user.workspace._id },
    { $unset: { team: "" } }
  );

  res.json({
    success: true,
    message: "Team deleted successfully"
  });
});
