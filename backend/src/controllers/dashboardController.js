import { addDays, format, startOfWeek } from "date-fns";

import { REFERENCE_DATE } from "../config/reference.js";
import { FileAsset } from "../models/FileAsset.js";
import { Notification } from "../models/Notification.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function statusLabel(status) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const workspaceId = req.user.workspace._id;
  const today = new Date(REFERENCE_DATE);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const [tasks, projects, members, notifications, files] = await Promise.all([
    Task.find({ workspace: workspaceId })
      .populate("project assignee comments.user")
      .sort({ dueDate: 1 })
      .lean(),
    Project.find({ workspace: workspaceId }).lean(),
    User.find({ workspace: workspaceId }).lean(),
    Notification.find({ workspace: workspaceId, user: req.user._id }).lean(),
    FileAsset.find({ workspace: workspaceId }).populate("uploadedBy project").lean()
  ]);

  const completed = tasks.filter((task) => task.status === "done").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const dueToday = tasks.filter((task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate).toDateString() === today.toDateString();
  }).length;

  const teamMembers = members.length;

  const priorityMap = {
    high: tasks.filter((task) => task.priority === "high").length,
    medium: tasks.filter((task) => task.priority === "medium").length,
    low: tasks.filter((task) => task.priority === "low").length
  };

  const progressByProject = projects
    .filter((project) => project.status !== "archived")
    .slice(0, 3)
    .map((project) => ({
      id: project._id,
      name: project.name,
      progress: project.progress,
      color: project.color
    }));

  const weeklyLabels = Array.from({ length: 7 }, (_, index) =>
    format(addDays(weekStart, index), "EEE")
  );

  const weeklyProgress = projects.slice(0, 3).map((project, projectIndex) => ({
    name: project.name,
    color: project.color,
    points: weeklyLabels.map((_label, index) =>
      Math.min(100, Math.max(0, project.progress - 25 + index * (projectIndex + 4)))
    )
  }));

  const upcomingTasks = tasks
    .filter((task) => task.status !== "done")
    .slice(0, 4)
    .map((task) => ({
      id: task._id,
      title: task.title,
      project: task.project?.name,
      priority: task.priority,
      dueDate: task.dueDate
    }));

  const teamActivity = tasks
    .flatMap((task) =>
      task.comments.map((comment) => ({
        id: comment._id,
        user: comment.user,
        text: comment.text,
        createdAt: comment.createdAt
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const completionRate =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  const taskSummary = {
    completed,
    inProgress,
    todo: tasks.filter((task) => task.status === "todo").length,
    blocked: tasks.filter((task) => task.status === "blocked").length
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const recentFiles = files
    .filter((file) => file.kind === "file")
    .slice(0, 3)
    .map((file) => ({
      id: file._id,
      name: file.name,
      project: file.project?.name,
      uploadedBy: file.uploadedBy?.name,
      updatedAt: file.updatedAt
    }));

  res.json({
    success: true,
    data: {
      greeting: `Good morning, ${req.user.name.split(" ")[0]}!`,
      dateRange: {
        start: weekStart,
        end: weekEnd
      },
      stats: {
        totalTasks: tasks.length,
        inProgress,
        completed,
        dueToday,
        teamMembers
      },
      progressByProject,
      priorityBreakdown: priorityMap,
      upcomingTasks,
      weeklyProgress,
      weeklyLabels,
      teamActivity,
      taskSummary,
      completionRate,
      unreadCount,
      recentFiles,
      statusOptions: Object.keys(taskSummary).map((status) => ({
        label: statusLabel(status),
        value: taskSummary[status]
      }))
    }
  });
});
