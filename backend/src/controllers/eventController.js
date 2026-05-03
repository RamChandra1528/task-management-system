import { Event } from "../models/Event.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { optionalArray, optionalRef } from "../utils/payload.js";

const eventPopulate = [
  { path: "project", select: "name color" },
  { path: "task", select: "title status priority" },
  { path: "attendees", select: "name avatar role" }
];

export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ workspace: req.user.workspace._id })
    .populate(eventPopulate)
    .sort({ start: 1 })
    .lean();

  res.json({
    success: true,
    data: events
  });
});

export const createEvent = asyncHandler(async (req, res) => {
  const { title, start, end, description, project, task, attendees, priority, tags, color } =
    req.body;

  if (!title || !start || !end) {
    throw httpError(400, "Title, start, and end are required");
  }

  const event = await Event.create({
    workspace: req.user.workspace._id,
    title,
    start,
    end,
    description,
    project: optionalRef(project),
    task: optionalRef(task),
    attendees: optionalArray(attendees),
    priority,
    tags: optionalArray(tags),
    color
  });

  const populatedEvent = await Event.findById(event._id).populate(eventPopulate).lean();

  res.status(201).json({
    success: true,
    data: populatedEvent
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!event) {
    throw httpError(404, "Event not found");
  }

  const fields = [
    "title",
    "start",
    "end",
    "description",
    "project",
    "task",
    "attendees",
    "priority",
    "tags",
    "color"
  ];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      if (["project", "task"].includes(field)) {
        event[field] = optionalRef(req.body[field]);
      } else if (["attendees", "tags"].includes(field)) {
        event[field] = optionalArray(req.body[field]);
      } else {
        event[field] = req.body[field];
      }
    }
  }

  await event.save();

  const populatedEvent = await Event.findById(event._id).populate(eventPopulate).lean();

  res.json({
    success: true,
    data: populatedEvent
  });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOneAndDelete({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!event) {
    throw httpError(404, "Event not found");
  }

  res.json({
    success: true,
    message: "Event deleted successfully"
  });
});
