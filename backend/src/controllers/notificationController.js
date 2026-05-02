import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    workspace: req.user.workspace._id,
    user: req.user._id
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: notifications
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id,
    user: req.user._id
  });

  if (!notification) {
    throw httpError(404, "Notification not found");
  }

  notification.read = true;
  await notification.save();

  res.json({
    success: true,
    data: notification
  });
});
