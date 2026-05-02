import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const memberPopulate = { path: "members", select: "name avatar role jobTitle presence" };

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    workspace: req.user.workspace._id,
    members: req.user._id
  })
    .populate(memberPopulate)
    .populate({ path: "project", select: "name color" })
    .sort({ lastMessageAt: -1 })
    .lean();

  const payload = await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = await Message.findOne({
        conversation: conversation._id
      })
        .populate({ path: "sender", select: "name avatar role" })
        .sort({ createdAt: -1 })
        .lean();

      return {
        ...conversation,
        lastMessage
      };
    })
  );

  res.json({
    success: true,
    data: payload
  });
});

export const getConversationById = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id,
    members: req.user._id
  })
    .populate(memberPopulate)
    .populate({ path: "createdBy", select: "name avatar role" })
    .populate({ path: "project", select: "name color" })
    .lean();

  if (!conversation) {
    throw httpError(404, "Conversation not found");
  }

  const messages = await Message.find({
    conversation: conversation._id,
    workspace: req.user.workspace._id
  })
    .populate({ path: "sender", select: "name avatar role jobTitle presence" })
    .sort({ createdAt: 1 })
    .lean();

  res.json({
    success: true,
    data: {
      conversation,
      messages
    }
  });
});

export const createConversation = asyncHandler(async (req, res) => {
  const { name, type = "group", members = [], about, project } = req.body;

  if (!name) {
    throw httpError(400, "Conversation name is required");
  }

  const conversation = await Conversation.create({
    workspace: req.user.workspace._id,
    name,
    type,
    members: Array.from(new Set([req.user._id.toString(), ...members])).map(
      (member) => member
    ),
    createdBy: req.user._id,
    about,
    project
  });

  const populatedConversation = await Conversation.findById(conversation._id)
    .populate(memberPopulate)
    .lean();

  res.status(201).json({
    success: true,
    data: populatedConversation
  });
});

export const postMessage = asyncHandler(async (req, res) => {
  const { body, attachments = [] } = req.body;

  if (!body) {
    throw httpError(400, "Message body is required");
  }

  const conversation = await Conversation.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id,
    members: req.user._id
  });

  if (!conversation) {
    throw httpError(404, "Conversation not found");
  }

  const message = await Message.create({
    workspace: req.user.workspace._id,
    conversation: conversation._id,
    sender: req.user._id,
    body,
    attachments
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate({ path: "sender", select: "name avatar role jobTitle presence" })
    .lean();

  res.status(201).json({
    success: true,
    data: populatedMessage
  });
});
