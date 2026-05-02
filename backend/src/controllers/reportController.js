import { eachWeekOfInterval, endOfMonth, format, startOfMonth } from "date-fns";

import { REFERENCE_DATE } from "../config/reference.js";
import { FileAsset } from "../models/FileAsset.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getReportsSummary = asyncHandler(async (req, res) => {
  const workspaceId = req.user.workspace._id;
  const monthStart = startOfMonth(new Date(REFERENCE_DATE));
  const monthEnd = endOfMonth(new Date(REFERENCE_DATE));

  const [tasks, projects, users, files] = await Promise.all([
    Task.find({ workspace: workspaceId })
      .populate("project assignee comments.user")
      .lean(),
    Project.find({ workspace: workspaceId }).lean(),
    User.find({ workspace: workspaceId }).lean(),
    FileAsset.find({ workspace: workspaceId }).populate("uploadedBy").lean()
  ]);

  const totalProjects = projects.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
  const overdueTasks = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"
  ).length;

  const statusBuckets = {
    completed: completedTasks,
    inProgress: inProgressTasks,
    pending: tasks.filter((task) => task.status === "todo").length,
    overdue: overdueTasks,
    onHold: tasks.filter((task) => task.status === "blocked").length
  };

  const totalTasks = tasks.length;

  const weeks = eachWeekOfInterval({
    start: monthStart,
    end: monthEnd
  });

  const completionTrend = weeks.map((week) => {
    const label = format(week, "MMM d");
    const value = tasks.filter(
      (task) => task.updatedAt && new Date(task.updatedAt) <= week && task.status === "done"
    ).length;

    return { label, value };
  });

  const teamWorkload = users.slice(0, 5).map((user) => {
    const assignedCount = tasks.filter(
      (task) => String(task.assignee?._id || task.assignee) === String(user._id)
    ).length;

    return {
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      load: Math.min(90, 20 + assignedCount * 15)
    };
  });

  const recentActivity = [
    ...files.flatMap((file) =>
      file.activity.map((activity) => ({
        id: activity._id,
        type: activity.action,
        user: activity.user,
        note: activity.note,
        createdAt: activity.createdAt
      }))
    ),
    ...tasks.flatMap((task) =>
      task.comments.map((comment) => ({
        id: comment._id,
        type: "commented",
        user: comment.user,
        note: comment.text,
        createdAt: comment.createdAt
      }))
    )
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const projectsProgress = projects.map((project) => ({
    id: project._id,
    name: project.name,
    progress: project.progress,
    color: project.color
  }));

  const priorityBreakdown = {
    high: tasks.filter((task) => task.priority === "high").length,
    medium: tasks.filter((task) => task.priority === "medium").length,
    low: tasks.filter((task) => task.priority === "low").length,
    none: tasks.filter((task) => !task.priority).length
  };

  res.json({
    success: true,
    data: {
      period: {
        start: monthStart,
        end: monthEnd
      },
      cards: {
        totalProjects,
        completedTasks,
        inProgressTasks,
        overdueTasks
      },
      taskOverview: {
        total: totalTasks,
        buckets: statusBuckets
      },
      completionTrend,
      projectSummary: {
        totalProjects,
        activeProjects: projects.filter((project) => project.status === "active").length,
        completedProjects: projects.filter((project) => project.status === "completed").length,
        onHoldProjects: projects.filter((project) => project.status === "on-hold").length,
        cancelledProjects: projects.filter((project) => project.status === "archived").length
      },
      teamWorkload,
      recentActivity,
      projectsProgress,
      priorityBreakdown
    }
  });
});
