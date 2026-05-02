import { Project } from "../models/Project.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { slugify } from "../utils/slugify.js";

const projectPopulate = [
  { path: "owner", select: "name email jobTitle avatar role presence" },
  { path: "members", select: "name email jobTitle avatar role presence" },
  { path: "teams", select: "name color department" }
];

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

  const project = await Project.create({
    workspace: req.user.workspace._id,
    owner: req.user._id,
    name,
    slug: slugify(name),
    description,
    color,
    icon,
    status,
    priority,
    progress,
    members: members || [req.user._id],
    teams: teams || [],
    dueDate,
    startDate,
    category,
    tags
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
      project[field] = req.body[field];
    }
  }

  if (req.body.name) {
    project.slug = slugify(req.body.name);
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
  const project = await Project.findOneAndDelete({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!project) {
    throw httpError(404, "Project not found");
  }

  res.json({
    success: true,
    message: "Project deleted successfully"
  });
});
