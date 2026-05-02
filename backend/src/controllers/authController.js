import { Notification } from "../models/Notification.js";
import { Team } from "../models/Team.js";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { httpError } from "../utils/httpError.js";
import { slugify } from "../utils/slugify.js";

function authPayload(user, unreadNotifications = 0) {
  return {
    token: generateToken(user._id),
    user,
    workspace: user.workspace,
    unreadNotifications
  };
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, workspaceName } = req.body;

  if (!name || !email || !password) {
    throw httpError(400, "Name, email, and password are required");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw httpError(409, "An account with this email already exists");
  }

  let workspace = await Workspace.findOne().sort({ createdAt: 1 });
  let role = "member";

  if (!workspace) {
    workspace = await Workspace.create({
      name: workspaceName || `${name}'s Workspace`,
      slug: slugify(workspaceName || name)
    });
    role = "admin";
  }

  const defaultTeam = await Team.findOne({ workspace: workspace._id });

  const user = await User.create({
    workspace: workspace._id,
    team: defaultTeam?._id,
    name,
    email,
    password,
    role,
    jobTitle: role === "admin" ? "Workspace Owner" : "Team Member",
    department: defaultTeam?.department || "General",
    avatar: {
      bg: "linear-gradient(135deg, #c4b5fd 0%, #7c3aed 100%)",
      text: "#ffffff"
    },
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

  if (!workspace.owner) {
    workspace.owner = user._id;
    await workspace.save();
  }

  const populatedUser = await User.findById(user._id)
    .populate("workspace team")
    .lean();

  res.status(201).json({
    success: true,
    data: authPayload(populatedUser, 0)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw httpError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+password")
    .populate("workspace team");

  if (!user || !(await user.comparePassword(password))) {
    throw httpError(401, "Invalid email or password");
  }

  const unreadNotifications = await Notification.countDocuments({
    user: user._id,
    read: false
  });

  const plainUser = user.toObject();
  delete plainUser.password;

  res.json({
    success: true,
    data: authPayload(plainUser, unreadNotifications)
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("workspace team").lean();
  const unreadNotifications = await Notification.countDocuments({
    user: req.user._id,
    read: false
  });

  res.json({
    success: true,
    data: authPayload(user, unreadNotifications)
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});
