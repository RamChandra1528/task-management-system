import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { optionalArray, optionalRef } from "../utils/payload.js";

const taskPopulate = [
  {
    path: "project",
    select: "name color status progress dueDate category members"
  },
  {
    path: "assignee",
    select: "name email avatar role presence jobTitle"
  },
  {
    path: "reporter",
    select: "name email avatar role presence jobTitle"
  },
  {
    path: "comments.user",
    select: "name avatar role jobTitle"
  }
];

function isProjectMember(project, userId) {
  return project.members?.some((memberId) => String(memberId) === String(userId));
}

function canUseProject(project, user) {
  return (
    user.role === "admin" ||
    String(project.owner) === String(user._id) ||
    isProjectMember(project, user._id)
  );
}

function canManageTask(task, project, user) {
  return (
    user.role === "admin" ||
    String(task.reporter) === String(user._id) ||
    String(task.assignee) === String(user._id) ||
    canUseProject(project, user)
  );
}

function canDeleteTask(task, user) {
  return user.role === "admin" || String(task.reporter) === String(user._id);
}

async function getWorkspaceProject(projectId, workspaceId) {
  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId
  });

  if (!project) {
    throw httpError(400, "Selected project does not exist in this workspace");
  }

  return project;
}

async function validateTaskAssignment({ project, assignee, workspaceId }) {
  const assigneeExists = await User.exists({ _id: assignee, workspace: workspaceId });
  if (!assigneeExists) {
    throw httpError(400, "Selected assignee does not exist in this workspace");
  }

  if (!isProjectMember(project, assignee)) {
    throw httpError(400, "Task assignee must be a member of the selected project");
  }
}

export const getTasks = asyncHandler(async (req, res) => {
  const { search = "", status, priority, project } = req.query;
  const query = { workspace: req.user.workspace._id };

  if (status && status !== "all") {
    query.status = status;
  }
  if (priority && priority !== "all") {
    query.priority = priority;
  }
  if (project) {
    query.project = project;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $elemMatch: { $regex: search, $options: "i" } } }
    ];
  }

  const tasks = await Task.find(query)
    .populate(taskPopulate)
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: tasks
  });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  })
    .populate(taskPopulate)
    .lean();

  if (!task) {
    throw httpError(404, "Task not found");
  }

  res.json({
    success: true,
    data: task
  });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, project, assignee, description, status, priority, dueDate, sprint, estimatedHours, tags, checklist, attachments, category } =
    req.body;

  if (!title || !project || !assignee) {
    throw httpError(400, "Title, project, and assignee are required");
  }

  const projectDoc = await getWorkspaceProject(project, req.user.workspace._id);

  if (!canUseProject(projectDoc, req.user)) {
    throw httpError(403, "You must be an admin or project member to create tasks in this project");
  }

  await validateTaskAssignment({
    project: projectDoc,
    assignee,
    workspaceId: req.user.workspace._id
  });

  const task = await Task.create({
    workspace: req.user.workspace._id,
    reporter: req.user._id,
    title,
    project,
    assignee,
    description,
    status,
    priority,
    dueDate: optionalRef(dueDate),
    sprint,
    estimatedHours,
    tags: optionalArray(tags),
    checklist: optionalArray(checklist),
    attachments: optionalArray(attachments),
    category
  });

  const populatedTask = await Task.findById(task._id).populate(taskPopulate).lean();

  res.status(201).json({
    success: true,
    data: populatedTask
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!task) {
    throw httpError(404, "Task not found");
  }

  const currentProject = await getWorkspaceProject(task.project, req.user.workspace._id);

  if (!canManageTask(task, currentProject, req.user)) {
    throw httpError(403, "Only admins, project members, reporters, and assignees can update this task");
  }

  const targetProject =
    req.body.project && String(req.body.project) !== String(task.project)
      ? await getWorkspaceProject(req.body.project, req.user.workspace._id)
      : currentProject;

  if (!canUseProject(targetProject, req.user)) {
    throw httpError(403, "You must be an admin or project member to move a task to this project");
  }

  const nextAssignee = req.body.assignee || task.assignee;
  await validateTaskAssignment({
    project: targetProject,
    assignee: nextAssignee,
    workspaceId: req.user.workspace._id
  });

  const fields = [
    "title",
    "project",
    "assignee",
    "description",
    "status",
    "priority",
    "dueDate",
    "startDate",
    "sprint",
    "estimatedHours",
    "tags",
    "checklist",
    "attachments",
    "category"
  ];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      if (["dueDate", "startDate"].includes(field)) {
        task[field] = optionalRef(req.body[field]);
      } else if (["tags", "checklist", "attachments"].includes(field)) {
        task[field] = optionalArray(req.body[field]);
      } else if (field === "project") {
        task[field] = req.body[field];
      } else if (field === "assignee") {
        task[field] = req.body[field];
      } else {
        task[field] = req.body[field];
      }
    }
  }

  await task.save();

  const populatedTask = await Task.findById(task._id).populate(taskPopulate).lean();

  res.json({
    success: true,
    data: populatedTask
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!task) {
    throw httpError(404, "Task not found");
  }

  if (!canDeleteTask(task, req.user)) {
    throw httpError(403, "Only admins and task reporters can delete this task");
  }

  await task.deleteOne();

  res.json({
    success: true,
    message: "Task deleted successfully"
  });
});

export const addTaskComment = asyncHandler(async (req, res) => {
  if (!req.body.text) {
    throw httpError(400, "Comment text is required");
  }

  const task = await Task.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!task) {
    throw httpError(404, "Task not found");
  }

  const project = await getWorkspaceProject(task.project, req.user.workspace._id);
  if (!canManageTask(task, project, req.user)) {
    throw httpError(403, "Only admins, project members, reporters, and assignees can comment on this task");
  }

  task.comments.push({
    user: req.user._id,
    text: req.body.text
  });

  await task.save();

  const populatedTask = await Task.findById(task._id).populate(taskPopulate).lean();

  res.status(201).json({
    success: true,
    data: populatedTask
  });
});
