import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

export const getUsers = asyncHandler(async (req, res) => {
  const { search = "", team, department } = req.query;

  const query = {
    workspace: req.user.workspace._id
  };

  if (team) {
    query.team = team;
  }

  if (department) {
    query.department = department;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { jobTitle: { $regex: search, $options: "i" } }
    ];
  }

  const users = await User.find(query)
    .populate("team workspace")
    .sort({ name: 1 })
    .lean();

  res.json({
    success: true,
    data: users
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  })
    .populate("team workspace")
    .lean();

  if (!user) {
    throw httpError(404, "User not found");
  }

  res.json({
    success: true,
    data: user
  });
});

export const updateMeProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name",
    "jobTitle",
    "email",
    "phone",
    "location",
    "bio"
  ];

  const user = await User.findById(req.user._id);

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  }

  await user.save();

  const populatedUser = await User.findById(user._id).populate("workspace team").lean();

  res.json({
    success: true,
    data: populatedUser
  });
});

export const updateMePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.preferences = {
    ...user.preferences.toObject(),
    ...req.body,
    notifications: {
      ...user.preferences.notifications,
      ...(req.body.notifications || {})
    }
  };

  await user.save();

  const populatedUser = await User.findById(user._id).populate("workspace team").lean();

  res.json({
    success: true,
    data: populatedUser
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = "member", team, jobTitle, department } =
    req.body;

  if (!name || !email || !password) {
    throw httpError(400, "Name, email, and password are required");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    throw httpError(409, "This email is already in use");
  }

  const user = await User.create({
    workspace: req.user.workspace._id,
    team: team || null,
    name,
    email,
    password,
    role,
    jobTitle: jobTitle || "Team Member",
    department: department || "General",
    presence: "online",
    permissions:
      role === "admin"
        ? [
            "Project Management",
            "Task Management",
            "Team Management",
            "Reports Access",
            "Billing Management"
          ]
        : ["Project Management", "Task Management", "Reports Access"]
  });

  const populatedUser = await User.findById(user._id).populate("team workspace").lean();

  res.status(201).json({
    success: true,
    data: populatedUser
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!user) {
    throw httpError(404, "User not found");
  }

  const fields = [
    "name",
    "email",
    "role",
    "team",
    "jobTitle",
    "department",
    "presence",
    "phone",
    "location",
    "bio",
    "permissions"
  ];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  }

  await user.save();

  const populatedUser = await User.findById(user._id).populate("team workspace").lean();

  res.json({
    success: true,
    data: populatedUser
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    throw httpError(400, "You cannot remove your own account here");
  }

  const user = await User.findOneAndDelete({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!user) {
    throw httpError(404, "User not found");
  }

  res.json({
    success: true,
    message: "User removed successfully"
  });
});

export const deleteMe = asyncHandler(async (req, res) => {
  await User.findOneAndDelete({
    _id: req.user._id,
    workspace: req.user.workspace._id
  });

  res.json({
    success: true,
    message: "Account deleted successfully"
  });
});
