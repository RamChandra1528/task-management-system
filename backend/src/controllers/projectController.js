import { Project } from "../models/Project.js";
import { Team } from "../models/Team.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { clampPercent, optionalArray, optionalRef } from "../utils/payload.js";
import { slugify } from "../utils/slugify.js";

const projectPopulate = [
  { path: "owner", select: "name email jobTitle avatar role presence" },
  { path: "members", select: "name email jobTitle avatar role presence" },
  { path: "teams", select: "name color department" }
];

async function uniqueProjectSlug(name, workspaceId, excludeId) {
  const baseSlug = slugify(name);
  const query = { workspace: workspaceId, slug: baseSlug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await Project.exists(query);
  if (!existing) {
    return baseSlug;
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

function isProjectMember(project, userId) {
  return project.members.some((memberId) => String(memberId) === String(userId));
}

function canEditProject(project, user) {
  return (
    user.role === "admin" ||
    String(project.owner) === String(user._id) ||
    isProjectMember(project, user._id)
  );
}

function canDeleteProject(project, user) {
  return user.role === "admin" || String(project.owner) === String(user._id);
}

async function validateWorkspaceRefs({ workspaceId, members = [], teams = [] }) {
  const [memberCount, teamCount] = await Promise.all([
    members.length
      ? User.countDocuments({ _id: { $in: members }, workspace: workspaceId })
      : 0,
    teams.length
      ? Team.countDocuments({ _id: { $in: teams }, workspace: workspaceId })
      : 0
  ]);

  if (memberCount !== members.length) {
    throw httpError(400, "All project members must belong to this workspace");
  }

  if (teamCount !== teams.length) {
    throw httpError(400, "All project teams must belong to this workspace");
  }
}

function uniqueIds(values) {
  return Array.from(new Set(optionalArray(values).map((value) => String(value))));
}

export const getProjects = asyncHandler(async (req, res) => {
  const { status, search = "" } = req.query;
  const query = { workspace: req.user.workspace._id };

  if (status && status !== "all") {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
  }

  const projects = await Project.find(query)
    .populate(projectPopulate)
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: projects
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  })
    .populate(projectPopulate)
    .lean();

  if (!project) {
    throw httpError(404, "Project not found");
  }

  res.json({
    success: true,
    data: project
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, color, icon, status, priority, progress, members, teams, dueDate, startDate, category, tags } =
    req.body;

  if (!name) {
    throw httpError(400, "Project name is required");
  }

  const projectMembers = uniqueIds(members);
  if (!projectMembers.includes(String(req.user._id))) {
    projectMembers.push(String(req.user._id));
  }
  const projectTeams = uniqueIds(teams);

  await validateWorkspaceRefs({
    workspaceId: req.user.workspace._id,
    members: projectMembers,
    teams: projectTeams
  });

  const project = await Project.create({
    workspace: req.user.workspace._id,
    owner: req.user._id,
    name,
    slug: await uniqueProjectSlug(name, req.user.workspace._id),
    description,
    color,
    icon,
    status,
    priority,
    progress: clampPercent(progress),
    members: projectMembers,
    teams: projectTeams,
    dueDate: optionalRef(dueDate),
    startDate: optionalRef(startDate),
    category,
    tags: optionalArray(tags)
  });

  const populatedProject = await Project.findById(project._id)
    .populate(projectPopulate)
    .lean();

  res.status(201).json({
    success: true,
    data: populatedProject
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!project) {
    throw httpError(404, "Project not found");
  }

  if (!canEditProject(project, req.user)) {
    throw httpError(403, "Only admins, project owners, and project members can update this project");
  }

  if (req.body.members !== undefined || req.body.teams !== undefined) {
    if (req.user.role !== "admin" && String(project.owner) !== String(req.user._id)) {
      throw httpError(403, "Only admins and project owners can change project membership");
    }

    await validateWorkspaceRefs({
      workspaceId: req.user.workspace._id,
      members: req.body.members !== undefined ? uniqueIds(req.body.members) : project.members,
      teams: req.body.teams !== undefined ? uniqueIds(req.body.teams) : project.teams
    });
  }

  const fields = [
    "name",
    "description",
    "color",
    "icon",
    "status",
    "priority",
    "progress",
    "members",
    "teams",
    "dueDate",
    "startDate",
    "category",
    "tags"
  ];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      if (["dueDate", "startDate"].includes(field)) {
        project[field] = optionalRef(req.body[field]);
      } else if (["members", "teams", "tags"].includes(field)) {
        if (field === "tags") {
          project[field] = optionalArray(req.body[field]);
        } else if (field === "members") {
          const nextMembers = uniqueIds(req.body[field]);
          if (!nextMembers.includes(String(project.owner))) {
            nextMembers.push(String(project.owner));
          }
          project[field] = nextMembers;
        } else {
          project[field] = uniqueIds(req.body[field]);
        }
      } else if (field === "progress") {
        project[field] = clampPercent(req.body[field]);
      } else {
        project[field] = req.body[field];
      }
    }
  }

  if (req.body.name) {
    project.slug = await uniqueProjectSlug(
      req.body.name,
      req.user.workspace._id,
      project._id
    );
  }

  await project.save();

  const populatedProject = await Project.findById(project._id)
    .populate(projectPopulate)
    .lean();

  res.json({
    success: true,
    data: populatedProject
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!project) {
    throw httpError(404, "Project not found");
  }

  if (!canDeleteProject(project, req.user)) {
    throw httpError(403, "Only admins and project owners can delete this project");
  }

  await project.deleteOne();

  res.json({
    success: true,
    message: "Project deleted successfully"
  });
});
