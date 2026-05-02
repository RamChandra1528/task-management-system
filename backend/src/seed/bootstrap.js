import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import { REFERENCE_DATE } from "../config/reference.js";
import { Conversation } from "../models/Conversation.js";
import { Event } from "../models/Event.js";
import { FileAsset } from "../models/FileAsset.js";
import { Message } from "../models/Message.js";
import { Notification } from "../models/Notification.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Team } from "../models/Team.js";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { formatBytes } from "../utils/formatters.js";
import { slugify } from "../utils/slugify.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../..");
const seedUploadDir = path.resolve(__dirname, "../../uploads/seed");

function ensureDirectory(target) {
  fs.mkdirSync(target, { recursive: true });
}

function createPdf(title, body) {
  const content = `${title}\n\n${body}`;
  const stream = `BT /F1 18 Tf 50 760 Td (${title}) Tj /F1 11 Tf 0 -30 Td (${body.replace(
    /[()]/g,
    ""
  )}) Tj ET`;

  return `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length ${stream.length} >> stream
${stream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000243 00000 n 
0000000313 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
${400 + content.length}
%%EOF`;
}

function ensureSeedFiles() {
  ensureDirectory(seedUploadDir);

  const assets = {
    projectBrief: path.join(seedUploadDir, "Project-Brief.pdf"),
    brandGuidelines: path.join(seedUploadDir, "Brand-Guidelines.pdf"),
    sprintPlan: path.join(seedUploadDir, "Sprint-Planning.xlsx"),
    designTokens: path.join(seedUploadDir, "Design-Tokens.fig"),
    presentation: path.join(seedUploadDir, "Quarterly-Presentation.pptx"),
    userFlow: path.join(seedUploadDir, "User-Flow.png")
  };

  if (!fs.existsSync(assets.projectBrief)) {
    fs.writeFileSync(
      assets.projectBrief,
      createPdf(
        "Project Brief",
        "Aurora website redesign scope, milestones, and deliverables."
      )
    );
  }

  if (!fs.existsSync(assets.brandGuidelines)) {
    fs.writeFileSync(
      assets.brandGuidelines,
      createPdf(
        "Brand Guidelines",
        "Palette, typography, spacing, and voice guidance for the campaign."
      )
    );
  }

  if (!fs.existsSync(assets.sprintPlan)) {
    fs.writeFileSync(
      assets.sprintPlan,
      "Task,Owner,Due Date\nSprint planning,James Park,2025-05-22\nSprint review,Emma Johnson,2025-05-21\n"
    );
  }

  if (!fs.existsSync(assets.designTokens)) {
    fs.writeFileSync(
      assets.designTokens,
      "TaskPro design tokens export for the Aurora UI system."
    );
  }

  if (!fs.existsSync(assets.presentation)) {
    fs.writeFileSync(
      assets.presentation,
      "TaskPro quarterly presentation deck for stakeholder review."
    );
  }

  if (!fs.existsSync(assets.userFlow)) {
    const source = path.join(projectRoot, "Dashboard.png");
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, assets.userFlow);
    } else {
      fs.writeFileSync(assets.userFlow, "");
    }
  }

  return assets;
}

function dateAt(iso) {
  return new Date(iso);
}

function attachment(name, sizeLabel, type) {
  return { name, sizeLabel, type, url: "" };
}

export async function bootstrapWorkspace({ force = false } = {}) {
  const existingUsers = await User.countDocuments();

  if (existingUsers > 0 && !force) {
    return { seeded: false };
  }

  if (force) {
    await Promise.all([
      Notification.deleteMany({}),
      Message.deleteMany({}),
      Conversation.deleteMany({}),
      FileAsset.deleteMany({}),
      Event.deleteMany({}),
      Task.deleteMany({}),
      Project.deleteMany({}),
      User.deleteMany({}),
      Team.deleteMany({}),
      Workspace.deleteMany({})
    ]);
  }

  const assets = ensureSeedFiles();

  const workspace = await Workspace.create({
    name: "Aurora Workspace",
    slug: "aurora-workspace",
    description:
      "A polished SaaS workspace for managing projects, tasks, calendars, files, team collaboration, and reporting.",
    plan: "pro",
    settings: {
      defaultTaskView: "board",
      tasksPerPage: 25,
      theme: "light",
      compactMode: false
    }
  });

  const teamDefs = [
    {
      name: "Product",
      color: "#7c3aed",
      description: "Roadmap, planning, and product strategy.",
      department: "Product"
    },
    {
      name: "Development",
      color: "#3b82f6",
      description: "Frontend, backend, and infrastructure delivery.",
      department: "Engineering"
    },
    {
      name: "Design",
      color: "#ec4899",
      description: "UI systems, prototyping, and experience design.",
      department: "Design"
    },
    {
      name: "Marketing",
      color: "#22c55e",
      description: "Campaign planning and growth initiatives.",
      department: "Marketing"
    },
    {
      name: "QA",
      color: "#f97316",
      description: "Quality assurance, automation, and release confidence.",
      department: "Quality"
    }
  ];

  const teamDocs = await Team.insertMany(
    teamDefs.map((team) => ({
      workspace: workspace._id,
      ...team,
      slug: slugify(team.name)
    }))
  );

  const teamMap = Object.fromEntries(teamDocs.map((team) => [team.name, team]));

  const userDefs = [
    {
      name: "Emma Johnson",
      email: "emma@aurora.com",
      role: "admin",
      team: "Product",
      jobTitle: "Product Manager",
      department: "Product",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      presence: "online",
      bio: "Product manager with 5+ years of experience in building user-focused digital products.",
      joinedAt: dateAt("2025-01-15T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #f9a8d4 0%, #fb7185 100%)",
        text: "#ffffff"
      },
      permissions: [
        "Project Management",
        "Task Management",
        "Team Management",
        "Reports Access",
        "Billing Management"
      ]
    },
    {
      name: "James Park",
      email: "james@aurora.com",
      role: "member",
      team: "Development",
      jobTitle: "Senior Developer",
      department: "Development",
      presence: "online",
      joinedAt: dateAt("2025-01-10T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Olivia Rhye",
      email: "olivia@aurora.com",
      role: "member",
      team: "Design",
      jobTitle: "UI/UX Designer",
      department: "Design",
      presence: "online",
      joinedAt: dateAt("2025-01-12T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #fbcfe8 0%, #e879f9 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "William Kim",
      email: "william@aurora.com",
      role: "member",
      team: "Marketing",
      jobTitle: "Marketing Lead",
      department: "Marketing",
      presence: "away",
      joinedAt: dateAt("2025-01-18T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #86efac 0%, #16a34a 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Sophia Lee",
      email: "sophia@aurora.com",
      role: "member",
      team: "Development",
      jobTitle: "Frontend Developer",
      department: "Development",
      presence: "online",
      joinedAt: dateAt("2025-01-20T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #fdba74 0%, #f97316 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Daniel Park",
      email: "daniel@aurora.com",
      role: "member",
      team: "Development",
      jobTitle: "Backend Developer",
      department: "Development",
      presence: "offline",
      joinedAt: dateAt("2025-01-22T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #818cf8 0%, #4338ca 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Lana Steiner",
      email: "lana@aurora.com",
      role: "member",
      team: "Design",
      jobTitle: "Product Designer",
      department: "Design",
      presence: "online",
      joinedAt: dateAt("2025-01-25T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #f9a8d4 0%, #fb7185 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Noah Smith",
      email: "noah@aurora.com",
      role: "member",
      team: "QA",
      jobTitle: "QA Engineer",
      department: "Development",
      presence: "away",
      joinedAt: dateAt("2025-01-28T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Mia Carter",
      email: "mia@aurora.com",
      role: "member",
      team: "Marketing",
      jobTitle: "Content Strategist",
      department: "Marketing",
      presence: "online",
      joinedAt: dateAt("2025-02-01T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #bbf7d0 0%, #22c55e 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Lucas Reed",
      email: "lucas@aurora.com",
      role: "member",
      team: "Development",
      jobTitle: "DevOps Engineer",
      department: "Development",
      presence: "online",
      joinedAt: dateAt("2025-02-03T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #bfdbfe 0%, #3b82f6 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Ava Patel",
      email: "ava@aurora.com",
      role: "member",
      team: "Product",
      jobTitle: "Operations Manager",
      department: "Product",
      presence: "online",
      joinedAt: dateAt("2025-02-05T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Ethan Brooks",
      email: "ethan@aurora.com",
      role: "member",
      team: "Marketing",
      jobTitle: "Growth Analyst",
      department: "Marketing",
      presence: "offline",
      joinedAt: dateAt("2025-02-07T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #fdba74 0%, #fb923c 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Grace Chen",
      email: "grace@aurora.com",
      role: "member",
      team: "Design",
      jobTitle: "Brand Designer",
      department: "Design",
      presence: "online",
      joinedAt: dateAt("2025-02-09T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #f5d0fe 0%, #d946ef 100%)",
        text: "#ffffff"
      }
    },
    {
      name: "Aiden Foster",
      email: "aiden@aurora.com",
      role: "member",
      team: "QA",
      jobTitle: "Automation Engineer",
      department: "Quality",
      presence: "online",
      joinedAt: dateAt("2025-02-11T12:00:00.000Z"),
      avatar: {
        bg: "linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)",
        text: "#ffffff"
      }
    }
  ];

  const createdUsers = await Promise.all(
    userDefs.map((user) =>
      User.create({
        workspace: workspace._id,
        team: teamMap[user.team]._id,
        name: user.name,
        email: user.email,
        password: "TaskPro123!",
        role: user.role,
        jobTitle: user.jobTitle,
        department: user.department,
        phone: user.phone || "",
        location: user.location || "New York, USA",
        bio: user.bio || "",
        presence: user.presence,
        joinedAt: user.joinedAt,
        lastActiveAt: REFERENCE_DATE,
        avatar: user.avatar,
        permissions:
          user.permissions || [
            "Project Management",
            "Task Management",
            "Reports Access"
          ]
      })
    )
  );

  const userMap = Object.fromEntries(createdUsers.map((user) => [user.email, user]));

  workspace.owner = userMap["emma@aurora.com"]._id;
  await workspace.save();

  await Team.updateMany(
    { workspace: workspace._id },
    [
      {
        $set: {
          lead: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$name", "Product"] },
                  then: userMap["emma@aurora.com"]._id
                },
                {
                  case: { $eq: ["$name", "Development"] },
                  then: userMap["james@aurora.com"]._id
                },
                {
                  case: { $eq: ["$name", "Design"] },
                  then: userMap["olivia@aurora.com"]._id
                },
                {
                  case: { $eq: ["$name", "Marketing"] },
                  then: userMap["william@aurora.com"]._id
                },
                {
                  case: { $eq: ["$name", "QA"] },
                  then: userMap["aiden@aurora.com"]._id
                }
              ],
              default: userMap["emma@aurora.com"]._id
            }
          }
        }
      }
    ]
  );

  const projectDefs = [
    {
      name: "Aurora Website Redesign",
      description:
        "Redesign the corporate website with modern UI/UX, improved performance, and better SEO. Focus on responsiveness and enhanced user experience.",
      color: "#7c3aed",
      icon: "sparkles",
      status: "active",
      priority: "high",
      progress: 75,
      startDate: dateAt("2025-03-01T12:00:00.000Z"),
      dueDate: dateAt("2025-05-22T12:00:00.000Z"),
      category: "UI/UX",
      tags: ["UI/UX", "High"],
      members: [
        "emma@aurora.com",
        "olivia@aurora.com",
        "sophia@aurora.com",
        "james@aurora.com"
      ],
      teams: ["Product", "Design", "Development"]
    },
    {
      name: "Mobile App Development",
      description:
        "Build and launch the new mobile app for iOS and Android platforms.",
      color: "#3b82f6",
      icon: "smartphone",
      status: "at-risk",
      priority: "medium",
      progress: 60,
      startDate: dateAt("2025-03-05T12:00:00.000Z"),
      dueDate: dateAt("2025-06-02T12:00:00.000Z"),
      category: "Mobile",
      tags: ["Mobile", "At Risk"],
      members: [
        "emma@aurora.com",
        "james@aurora.com",
        "sophia@aurora.com",
        "daniel@aurora.com"
      ],
      teams: ["Product", "Development"]
    },
    {
      name: "Marketing Campaign Q3",
      description:
        "Plan and execute the Q3 marketing campaign across all channels.",
      color: "#22c55e",
      icon: "megaphone",
      status: "active",
      priority: "low",
      progress: 40,
      startDate: dateAt("2025-04-01T12:00:00.000Z"),
      dueDate: dateAt("2025-07-14T12:00:00.000Z"),
      category: "Marketing",
      tags: ["Marketing", "Low"],
      members: ["william@aurora.com", "mia@aurora.com", "ethan@aurora.com"],
      teams: ["Marketing"]
    },
    {
      name: "Data Migration Phase 2",
      description:
        "Migrate legacy data to new cloud infrastructure and validate.",
      color: "#f97316",
      icon: "database",
      status: "active",
      priority: "medium",
      progress: 65,
      startDate: dateAt("2025-04-10T12:00:00.000Z"),
      dueDate: dateAt("2025-08-01T12:00:00.000Z"),
      category: "Backend",
      tags: ["Backend", "Medium"],
      members: ["daniel@aurora.com", "james@aurora.com", "aiden@aurora.com"],
      teams: ["Development", "QA"]
    },
    {
      name: "Customer Feedback Loop",
      description:
        "Collect and analyze customer feedback to improve products and services.",
      color: "#ec4899",
      icon: "message-circle",
      status: "active",
      priority: "medium",
      progress: 30,
      startDate: dateAt("2025-04-15T12:00:00.000Z"),
      dueDate: dateAt("2025-09-10T12:00:00.000Z"),
      category: "Research",
      tags: ["Research", "Active"],
      members: ["lana@aurora.com", "emma@aurora.com", "ava@aurora.com"],
      teams: ["Product", "Design"]
    },
    {
      name: "Internal Tooling Upgrade",
      description:
        "Upgrade internal tools to improve team productivity and collaboration.",
      color: "#8b5cf6",
      icon: "wrench",
      status: "active",
      priority: "medium",
      progress: 50,
      startDate: dateAt("2025-04-12T12:00:00.000Z"),
      dueDate: dateAt("2025-09-30T12:00:00.000Z"),
      category: "DevOps",
      tags: ["DevOps", "Medium"],
      members: ["lucas@aurora.com", "daniel@aurora.com", "james@aurora.com"],
      teams: ["Development"]
    },
    {
      name: "AI Workflow Automations",
      description: "Automate repeatable operations for support and internal workflows.",
      color: "#14b8a6",
      icon: "bot",
      status: "completed",
      priority: "medium",
      progress: 92,
      startDate: dateAt("2025-02-12T12:00:00.000Z"),
      dueDate: dateAt("2025-04-28T12:00:00.000Z"),
      category: "Automation",
      tags: ["Automation", "Completed"],
      members: ["lucas@aurora.com", "ava@aurora.com", "daniel@aurora.com"],
      teams: ["Development", "Product"]
    },
    {
      name: "Legacy Portal Sunset",
      description: "Retire the legacy customer portal and migrate all residual traffic.",
      color: "#64748b",
      icon: "archive",
      status: "archived",
      priority: "high",
      progress: 100,
      startDate: dateAt("2024-12-02T12:00:00.000Z"),
      dueDate: dateAt("2025-03-25T12:00:00.000Z"),
      category: "Infrastructure",
      tags: ["Archive"],
      members: ["daniel@aurora.com", "james@aurora.com", "aiden@aurora.com"],
      teams: ["Development", "QA"]
    }
  ];

  const projectDocs = await Project.insertMany(
    projectDefs.map((project) => ({
      workspace: workspace._id,
      owner: userMap["emma@aurora.com"]._id,
      ...project,
      slug: slugify(project.name),
      members: project.members.map((email) => userMap[email]._id),
      teams: project.teams.map((name) => teamMap[name]._id)
    }))
  );

  const projectMap = Object.fromEntries(projectDocs.map((project) => [project.name, project]));

  const taskDefs = [
    {
      title: "Design system update",
      project: "Aurora Website Redesign",
      assignee: "olivia@aurora.com",
      reporter: "emma@aurora.com",
      description:
        "Update the design system including colors, typography, spacing, and reusable components for consistency across the platform.",
      status: "in_progress",
      priority: "high",
      dueDate: dateAt("2025-05-12T16:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 8,
      category: "UI/UX",
      tags: ["UI/UX", "Design"],
      checklist: [
        { text: "Update color palette", completed: true },
        { text: "Update typography scale", completed: true },
        { text: "Update component library", completed: true },
        { text: "Update spacing system", completed: false },
        { text: "Review with design team", completed: false }
      ],
      attachments: [
        attachment("Design Tokens.fig", "2.4 MB", "fig"),
        attachment("Components.pdf", "1.8 MB", "pdf")
      ],
      comments: [
        {
          user: "olivia@aurora.com",
          text: "Updated the color palette. Please take a look!"
        },
        {
          user: "lana@aurora.com",
          text: "Looks good! Let's review the components next."
        }
      ]
    },
    {
      title: "Implement profile page",
      project: "Mobile App Development",
      assignee: "james@aurora.com",
      reporter: "emma@aurora.com",
      description: "Build and integrate the user profile page.",
      status: "todo",
      priority: "medium",
      dueDate: dateAt("2025-05-13T16:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 6,
      category: "Frontend",
      tags: ["Frontend"]
    },
    {
      title: "QA regression tests",
      project: "Aurora Website Redesign",
      assignee: "noah@aurora.com",
      reporter: "emma@aurora.com",
      description: "Run full regression tests for v1.2.",
      status: "review",
      priority: "high",
      dueDate: dateAt("2025-05-14T16:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 4,
      category: "QA",
      tags: ["QA"]
    },
    {
      title: "Marketing assets review",
      project: "Marketing Campaign Q3",
      assignee: "william@aurora.com",
      reporter: "emma@aurora.com",
      description: "Review visual and copy assets for the Q3 campaign.",
      status: "todo",
      priority: "low",
      dueDate: dateAt("2025-05-14T14:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 3,
      category: "Content",
      tags: ["Marketing"]
    },
    {
      title: "Build notification center",
      project: "Mobile App Development",
      assignee: "olivia@aurora.com",
      reporter: "emma@aurora.com",
      description: "In-app and email notification center design.",
      status: "in_progress",
      priority: "high",
      dueDate: dateAt("2025-05-15T16:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 7,
      category: "Frontend",
      tags: ["Frontend"]
    },
    {
      title: "API integration",
      project: "Data Migration Phase 2",
      assignee: "daniel@aurora.com",
      reporter: "emma@aurora.com",
      description: "Integrate with payment and third-party APIs.",
      status: "todo",
      priority: "medium",
      dueDate: dateAt("2025-05-16T16:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 10,
      category: "Backend",
      tags: ["Backend"]
    },
    {
      title: "User research interviews",
      project: "Customer Feedback Loop",
      assignee: "lana@aurora.com",
      reporter: "emma@aurora.com",
      description: "Interview users to uncover onboarding friction.",
      status: "todo",
      priority: "low",
      dueDate: dateAt("2025-05-17T16:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 5,
      category: "Research",
      tags: ["Research"]
    },
    {
      title: "Database schema design",
      project: "Data Migration Phase 2",
      assignee: "james@aurora.com",
      reporter: "emma@aurora.com",
      description: "Design and implement the initial schema.",
      status: "review",
      priority: "high",
      dueDate: dateAt("2025-05-18T16:00:00.000Z"),
      sprint: "Sprint 15 (May 16 - May 31)",
      estimatedHours: 8,
      category: "Backend",
      tags: ["Database"]
    },
    {
      title: "Create onboarding flow",
      project: "Mobile App Development",
      assignee: "sophia@aurora.com",
      reporter: "emma@aurora.com",
      description: "Finish the final onboarding path in the app.",
      status: "done",
      priority: "medium",
      dueDate: dateAt("2025-05-18T18:00:00.000Z"),
      sprint: "Sprint 15 (May 16 - May 31)",
      estimatedHours: 6,
      category: "Frontend",
      tags: ["UX"]
    },
    {
      title: "Landing page copy",
      project: "Aurora Website Redesign",
      assignee: "olivia@aurora.com",
      reporter: "emma@aurora.com",
      description: "Review and finalize landing page messaging.",
      status: "done",
      priority: "low",
      dueDate: dateAt("2025-05-19T18:00:00.000Z"),
      sprint: "Sprint 15 (May 16 - May 31)",
      estimatedHours: 2,
      category: "Content",
      tags: ["Content"]
    },
    {
      title: "Design login flow",
      project: "Aurora Website Redesign",
      assignee: "olivia@aurora.com",
      reporter: "emma@aurora.com",
      description: "Create a seamless login experience for users.",
      status: "backlog",
      priority: "medium",
      dueDate: dateAt("2025-05-05T18:00:00.000Z"),
      sprint: "Sprint 13 (Apr 15 - Apr 30)",
      estimatedHours: 5,
      category: "UI/UX",
      tags: ["UI/UX"]
    },
    {
      title: "Research SSO options",
      project: "Internal Tooling Upgrade",
      assignee: "daniel@aurora.com",
      reporter: "emma@aurora.com",
      description: "Evaluate Okta vs Auth0 vs Magic Link approaches.",
      status: "backlog",
      priority: "low",
      dueDate: dateAt("2025-05-07T18:00:00.000Z"),
      sprint: "Sprint 13 (Apr 15 - Apr 30)",
      estimatedHours: 4,
      category: "Security",
      tags: ["Security"]
    },
    {
      title: "Collect analytics events",
      project: "Internal Tooling Upgrade",
      assignee: "ava@aurora.com",
      reporter: "emma@aurora.com",
      description: "Define key events for onboarding funnel analytics.",
      status: "backlog",
      priority: "low",
      dueDate: dateAt("2025-05-12T16:00:00.000Z"),
      sprint: "Sprint 13 (Apr 15 - Apr 30)",
      estimatedHours: 2,
      category: "Analytics",
      tags: ["Analytics"]
    },
    {
      title: "Competitor audit",
      project: "Customer Feedback Loop",
      assignee: "lana@aurora.com",
      reporter: "emma@aurora.com",
      description: "Analyze top competitors and features.",
      status: "backlog",
      priority: "medium",
      dueDate: dateAt("2025-05-14T16:00:00.000Z"),
      sprint: "Sprint 13 (Apr 15 - Apr 30)",
      estimatedHours: 3,
      category: "Research",
      tags: ["Research"]
    },
    {
      title: "Create error states",
      project: "Mobile App Development",
      assignee: "sophia@aurora.com",
      reporter: "emma@aurora.com",
      description: "Design and implement error states.",
      status: "todo",
      priority: "medium",
      dueDate: dateAt("2025-05-07T16:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 3,
      category: "UX",
      tags: ["UX"]
    },
    {
      title: "Set up CI/CD pipeline",
      project: "Internal Tooling Upgrade",
      assignee: "lucas@aurora.com",
      reporter: "emma@aurora.com",
      description: "Configure GitHub Actions for deployment.",
      status: "todo",
      priority: "medium",
      dueDate: dateAt("2025-05-11T16:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 5,
      category: "DevOps",
      tags: ["DevOps"]
    },
    {
      title: "Write unit tests",
      project: "Internal Tooling Upgrade",
      assignee: "james@aurora.com",
      reporter: "emma@aurora.com",
      description: "Add unit tests for auth modules.",
      status: "todo",
      priority: "low",
      dueDate: dateAt("2025-05-13T16:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 4,
      category: "Testing",
      tags: ["Testing"]
    },
    {
      title: "Project setup",
      project: "Internal Tooling Upgrade",
      assignee: "daniel@aurora.com",
      reporter: "emma@aurora.com",
      description: "Initialize repo, tools and documentation.",
      status: "done",
      priority: "medium",
      dueDate: dateAt("2025-04-28T16:00:00.000Z"),
      sprint: "Sprint 13 (Apr 15 - Apr 30)",
      estimatedHours: 2,
      category: "DevOps",
      tags: ["DevOps"]
    },
    {
      title: "User flows",
      project: "Aurora Website Redesign",
      assignee: "olivia@aurora.com",
      reporter: "emma@aurora.com",
      description: "Create user flows for core features.",
      status: "done",
      priority: "low",
      dueDate: dateAt("2025-04-30T16:00:00.000Z"),
      sprint: "Sprint 13 (Apr 15 - Apr 30)",
      estimatedHours: 4,
      category: "UI/UX",
      tags: ["UI/UX"]
    },
    {
      title: "Staging deployment hardening",
      project: "AI Workflow Automations",
      assignee: "lucas@aurora.com",
      reporter: "emma@aurora.com",
      description: "Harden staging deployment configuration and rollbacks.",
      status: "in_progress",
      priority: "medium",
      dueDate: dateAt("2025-05-20T16:00:00.000Z"),
      sprint: "Sprint 15 (May 16 - May 31)",
      estimatedHours: 5,
      category: "DevOps",
      tags: ["Infra"]
    },
    {
      title: "Accessibility pass",
      project: "Aurora Website Redesign",
      assignee: "grace@aurora.com",
      reporter: "emma@aurora.com",
      description: "Review color contrast, focus states, and semantics.",
      status: "review",
      priority: "medium",
      dueDate: dateAt("2025-05-21T16:00:00.000Z"),
      sprint: "Sprint 15 (May 16 - May 31)",
      estimatedHours: 6,
      category: "Design QA",
      tags: ["Accessibility"]
    },
    {
      title: "Campaign launch checklist",
      project: "Marketing Campaign Q3",
      assignee: "mia@aurora.com",
      reporter: "william@aurora.com",
      description: "Finalize and review launch day checklist.",
      status: "in_progress",
      priority: "high",
      dueDate: dateAt("2025-05-22T16:00:00.000Z"),
      sprint: "Sprint 15 (May 16 - May 31)",
      estimatedHours: 4,
      category: "Marketing",
      tags: ["Launch"]
    },
    {
      title: "Customer sentiment tags",
      project: "Customer Feedback Loop",
      assignee: "ava@aurora.com",
      reporter: "emma@aurora.com",
      description: "Create tags for sentiment analysis dashboard.",
      status: "done",
      priority: "medium",
      dueDate: dateAt("2025-05-10T16:00:00.000Z"),
      sprint: "Sprint 14 (May 1 - May 15)",
      estimatedHours: 3,
      category: "Research",
      tags: ["Insights"]
    }
  ];

  const taskDocs = await Task.insertMany(
    taskDefs.map((task) => ({
      workspace: workspace._id,
      project: projectMap[task.project]._id,
      assignee: userMap[task.assignee]._id,
      reporter: userMap[task.reporter]._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      sprint: task.sprint,
      estimatedHours: task.estimatedHours,
      category: task.category,
      tags: task.tags,
      checklist: task.checklist || [],
      attachments: task.attachments || [],
      comments: (task.comments || []).map((comment) => ({
        user: userMap[comment.user]._id,
        text: comment.text,
        createdAt: REFERENCE_DATE,
        updatedAt: REFERENCE_DATE
      }))
    }))
  );

  const taskMap = Object.fromEntries(taskDocs.map((task) => [task.title, task]));

  const eventDefs = [
    {
      title: "Design system update",
      description:
        "Update the design system including colors, typography, components and documentation.",
      project: "Aurora Website Redesign",
      task: "Design system update",
      attendees: [
        "olivia@aurora.com",
        "emma@aurora.com",
        "lana@aurora.com",
        "sophia@aurora.com"
      ],
      priority: "high",
      tags: ["UI/UX", "Design"],
      color: "#7c3aed",
      start: dateAt("2025-05-12T14:00:00.000Z"),
      end: dateAt("2025-05-12T15:30:00.000Z")
    },
    {
      title: "Sprint planning",
      description: "Plan next sprint priorities and owners.",
      project: "Aurora Website Redesign",
      attendees: ["emma@aurora.com", "james@aurora.com", "olivia@aurora.com"],
      priority: "medium",
      tags: ["Planning"],
      color: "#3b82f6",
      start: dateAt("2025-05-02T15:00:00.000Z"),
      end: dateAt("2025-05-02T16:00:00.000Z")
    },
    {
      title: "Team standup",
      description: "Daily sync for blockers and progress.",
      project: "Mobile App Development",
      attendees: ["emma@aurora.com", "james@aurora.com", "sophia@aurora.com"],
      priority: "low",
      tags: ["Standup"],
      color: "#ec4899",
      start: dateAt("2025-05-02T19:00:00.000Z"),
      end: dateAt("2025-05-02T19:30:00.000Z")
    },
    {
      title: "User research interviews",
      description: "Interview customers about their onboarding experience.",
      project: "Customer Feedback Loop",
      task: "User research interviews",
      attendees: ["lana@aurora.com", "emma@aurora.com"],
      priority: "medium",
      tags: ["Research"],
      color: "#f97316",
      start: dateAt("2025-05-05T14:00:00.000Z"),
      end: dateAt("2025-05-05T15:00:00.000Z")
    },
    {
      title: "Mobile app development",
      description: "Review mobile sprint execution.",
      project: "Mobile App Development",
      attendees: ["james@aurora.com", "sophia@aurora.com", "daniel@aurora.com"],
      priority: "medium",
      tags: ["Mobile"],
      color: "#3b82f6",
      start: dateAt("2025-05-06T13:30:00.000Z"),
      end: dateAt("2025-05-06T14:30:00.000Z")
    },
    {
      title: "Team sync",
      description: "Cross-functional update across teams.",
      project: "Aurora Website Redesign",
      attendees: ["emma@aurora.com", "william@aurora.com", "olivia@aurora.com"],
      priority: "low",
      tags: ["Sync"],
      color: "#ec4899",
      start: dateAt("2025-05-06T20:00:00.000Z"),
      end: dateAt("2025-05-06T20:30:00.000Z")
    },
    {
      title: "Marketing assets review",
      description: "Review final campaign assets.",
      project: "Marketing Campaign Q3",
      task: "Marketing assets review",
      attendees: ["william@aurora.com", "mia@aurora.com"],
      priority: "medium",
      tags: ["Marketing"],
      color: "#22c55e",
      start: dateAt("2025-05-07T15:00:00.000Z"),
      end: dateAt("2025-05-07T16:00:00.000Z")
    },
    {
      title: "QA regression tests",
      description: "Run and review regression suite.",
      project: "Aurora Website Redesign",
      task: "QA regression tests",
      attendees: ["noah@aurora.com", "aiden@aurora.com"],
      priority: "high",
      tags: ["QA"],
      color: "#7c3aed",
      start: dateAt("2025-05-08T17:00:00.000Z"),
      end: dateAt("2025-05-08T18:30:00.000Z")
    },
    {
      title: "Implement profile page",
      description: "Complete profile page implementation.",
      project: "Mobile App Development",
      task: "Implement profile page",
      attendees: ["james@aurora.com", "sophia@aurora.com"],
      priority: "medium",
      tags: ["Frontend"],
      color: "#f97316",
      start: dateAt("2025-05-13T13:00:00.000Z"),
      end: dateAt("2025-05-13T14:00:00.000Z")
    },
    {
      title: "API integration",
      description: "API milestone pairing session.",
      project: "Data Migration Phase 2",
      task: "API integration",
      attendees: ["daniel@aurora.com", "james@aurora.com"],
      priority: "medium",
      tags: ["Backend"],
      color: "#3b82f6",
      start: dateAt("2025-05-14T18:00:00.000Z"),
      end: dateAt("2025-05-14T19:00:00.000Z")
    },
    {
      title: "Onboarding flow review",
      description: "Review onboarding for clarity and polish.",
      project: "Mobile App Development",
      task: "Create onboarding flow",
      attendees: ["emma@aurora.com", "sophia@aurora.com", "lana@aurora.com"],
      priority: "medium",
      tags: ["UX"],
      color: "#22c55e",
      start: dateAt("2025-05-15T15:30:00.000Z"),
      end: dateAt("2025-05-15T16:30:00.000Z")
    },
    {
      title: "Landing page copy review",
      description: "Review landing page narrative and CTA structure.",
      project: "Aurora Website Redesign",
      task: "Landing page copy",
      attendees: ["emma@aurora.com", "olivia@aurora.com", "grace@aurora.com"],
      priority: "low",
      tags: ["Content"],
      color: "#3b82f6",
      start: dateAt("2025-05-19T14:00:00.000Z"),
      end: dateAt("2025-05-19T15:00:00.000Z")
    },
    {
      title: "Database schema design",
      description: "Design workshop for migration schema.",
      project: "Data Migration Phase 2",
      task: "Database schema design",
      attendees: ["daniel@aurora.com", "james@aurora.com", "aiden@aurora.com"],
      priority: "medium",
      tags: ["Database"],
      color: "#f97316",
      start: dateAt("2025-05-20T17:00:00.000Z"),
      end: dateAt("2025-05-20T18:00:00.000Z")
    },
    {
      title: "Sprint review",
      description: "Review sprint outputs and lessons learned.",
      project: "Aurora Website Redesign",
      attendees: ["emma@aurora.com", "james@aurora.com", "olivia@aurora.com", "william@aurora.com"],
      priority: "medium",
      tags: ["Sprint"],
      color: "#7c3aed",
      start: dateAt("2025-05-21T15:00:00.000Z"),
      end: dateAt("2025-05-21T16:00:00.000Z")
    },
    {
      title: "Sprint planning",
      description: "Plan work for the next sprint cycle.",
      project: "Aurora Website Redesign",
      attendees: ["emma@aurora.com", "james@aurora.com", "olivia@aurora.com", "sophia@aurora.com"],
      priority: "medium",
      tags: ["Sprint"],
      color: "#3b82f6",
      start: dateAt("2025-05-22T15:00:00.000Z"),
      end: dateAt("2025-05-22T16:00:00.000Z")
    },
    {
      title: "Client feedback session",
      description: "Walk through design feedback with stakeholders.",
      project: "Aurora Website Redesign",
      attendees: ["emma@aurora.com", "olivia@aurora.com", "grace@aurora.com"],
      priority: "medium",
      tags: ["Client"],
      color: "#8b5cf6",
      start: dateAt("2025-05-23T20:00:00.000Z"),
      end: dateAt("2025-05-23T21:00:00.000Z")
    },
    {
      title: "Team sync",
      description: "Weekly team alignment.",
      project: "Aurora Website Redesign",
      attendees: ["emma@aurora.com", "james@aurora.com", "olivia@aurora.com"],
      priority: "low",
      tags: ["Sync"],
      color: "#ec4899",
      start: dateAt("2025-05-26T20:00:00.000Z"),
      end: dateAt("2025-05-26T20:30:00.000Z")
    },
    {
      title: "Marketing campaign Q3",
      description: "Kickoff session for the campaign timeline.",
      project: "Marketing Campaign Q3",
      attendees: ["william@aurora.com", "mia@aurora.com", "ethan@aurora.com"],
      priority: "medium",
      tags: ["Marketing"],
      color: "#22c55e",
      start: dateAt("2025-05-27T14:00:00.000Z"),
      end: dateAt("2025-05-27T15:00:00.000Z")
    },
    {
      title: "Data migration phase 2",
      description: "Migration readiness review.",
      project: "Data Migration Phase 2",
      attendees: ["daniel@aurora.com", "aiden@aurora.com"],
      priority: "medium",
      tags: ["Backend"],
      color: "#f97316",
      start: dateAt("2025-05-28T17:30:00.000Z"),
      end: dateAt("2025-05-28T18:30:00.000Z")
    },
    {
      title: "Performance testing",
      description: "Validate performance benchmarks before launch.",
      project: "Aurora Website Redesign",
      attendees: ["james@aurora.com", "aiden@aurora.com"],
      priority: "high",
      tags: ["Performance"],
      color: "#7c3aed",
      start: dateAt("2025-05-29T18:00:00.000Z"),
      end: dateAt("2025-05-29T19:00:00.000Z")
    }
  ];

  await Event.insertMany(
    eventDefs.map((event) => ({
      workspace: workspace._id,
      title: event.title,
      description: event.description,
      project: event.project ? projectMap[event.project]._id : null,
      task: event.task ? taskMap[event.task]._id : null,
      attendees: event.attendees.map((email) => userMap[email]._id),
      priority: event.priority,
      tags: event.tags,
      color: event.color,
      start: event.start,
      end: event.end
    }))
  );

  const fileDefs = [
    {
      name: "Design Assets",
      originalName: "Design Assets",
      kind: "folder",
      mimeType: "inode/directory",
      extension: "",
      sizeBytes: 0,
      sizeLabel: "0 B",
      project: "Aurora Website Redesign",
      uploadedBy: "olivia@aurora.com",
      description: "Shared folder for UI design source files.",
      activity: [{ user: "olivia@aurora.com", action: "created", note: "Created the folder" }]
    },
    {
      name: "Documentation",
      originalName: "Documentation",
      kind: "folder",
      mimeType: "inode/directory",
      extension: "",
      sizeBytes: 0,
      sizeLabel: "0 B",
      project: "Mobile App Development",
      uploadedBy: "james@aurora.com",
      description: "Technical documentation and notes.",
      activity: [{ user: "james@aurora.com", action: "created", note: "Created the folder" }]
    },
    {
      name: "Meeting Notes",
      originalName: "Meeting Notes",
      kind: "folder",
      mimeType: "inode/directory",
      extension: "",
      sizeBytes: 0,
      sizeLabel: "0 B",
      project: "Aurora Website Redesign",
      uploadedBy: "emma@aurora.com",
      description: "Shared notes and decisions from reviews.",
      activity: [{ user: "emma@aurora.com", action: "created", note: "Created the folder" }]
    },
    {
      name: "Research",
      originalName: "Research",
      kind: "folder",
      mimeType: "inode/directory",
      extension: "",
      sizeBytes: 0,
      sizeLabel: "0 B",
      project: "Marketing Campaign Q3",
      uploadedBy: "william@aurora.com",
      description: "Shared research material and references.",
      activity: [{ user: "william@aurora.com", action: "created", note: "Created the folder" }]
    },
    {
      name: "Project Brief.pdf",
      originalName: "Project Brief.pdf",
      kind: "file",
      mimeType: "application/pdf",
      extension: "pdf",
      project: "Aurora Website Redesign",
      uploadedBy: "olivia@aurora.com",
      sizeBytes: fs.statSync(assets.projectBrief).size,
      sizeLabel: formatBytes(fs.statSync(assets.projectBrief).size),
      storagePath: assets.projectBrief,
      description:
        "Project brief for the Aurora website redesign including objectives, scope, timeline and key deliverables.",
      sharedWith: [
        "emma@aurora.com",
        "james@aurora.com",
        "olivia@aurora.com",
        "sophia@aurora.com"
      ],
      activity: [
        { user: "olivia@aurora.com", action: "uploaded", note: "Uploaded the file" },
        { user: "james@aurora.com", action: "downloaded", note: "Downloaded the file" },
        { user: "sophia@aurora.com", action: "commented", note: "Looks good! Let's review in our next meeting." }
      ]
    },
    {
      name: "Design System.fig",
      originalName: "Design System.fig",
      kind: "file",
      mimeType: "application/octet-stream",
      extension: "fig",
      project: "Aurora Website Redesign",
      uploadedBy: "sophia@aurora.com",
      sizeBytes: fs.statSync(assets.designTokens).size,
      sizeLabel: formatBytes(fs.statSync(assets.designTokens).size),
      storagePath: assets.designTokens,
      description: "Figma source for the refreshed design system.",
      sharedWith: ["emma@aurora.com", "olivia@aurora.com", "lana@aurora.com"],
      activity: [{ user: "sophia@aurora.com", action: "uploaded", note: "Uploaded the file" }]
    },
    {
      name: "Brand Guidelines.pdf",
      originalName: "Brand Guidelines.pdf",
      kind: "file",
      mimeType: "application/pdf",
      extension: "pdf",
      project: "Marketing Campaign Q3",
      uploadedBy: "emma@aurora.com",
      sizeBytes: fs.statSync(assets.brandGuidelines).size,
      sizeLabel: formatBytes(fs.statSync(assets.brandGuidelines).size),
      storagePath: assets.brandGuidelines,
      description: "Core campaign brand rules and messaging.",
      sharedWith: ["william@aurora.com", "mia@aurora.com"],
      activity: [{ user: "emma@aurora.com", action: "uploaded", note: "Uploaded the file" }]
    },
    {
      name: "Sprint Planning.xlsx",
      originalName: "Sprint Planning.xlsx",
      kind: "file",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: "xlsx",
      project: "Mobile App Development",
      uploadedBy: "james@aurora.com",
      sizeBytes: fs.statSync(assets.sprintPlan).size,
      sizeLabel: formatBytes(fs.statSync(assets.sprintPlan).size),
      storagePath: assets.sprintPlan,
      description: "Current sprint plan and ownership matrix.",
      sharedWith: ["emma@aurora.com", "sophia@aurora.com", "daniel@aurora.com"],
      activity: [{ user: "james@aurora.com", action: "uploaded", note: "Uploaded the file" }]
    },
    {
      name: "User Flow.png",
      originalName: "User Flow.png",
      kind: "file",
      mimeType: "image/png",
      extension: "png",
      project: "Aurora Website Redesign",
      uploadedBy: "olivia@aurora.com",
      sizeBytes: fs.statSync(assets.userFlow).size,
      sizeLabel: formatBytes(fs.statSync(assets.userFlow).size),
      storagePath: assets.userFlow,
      description: "Flow diagram for core user journeys.",
      sharedWith: ["emma@aurora.com", "lana@aurora.com"],
      activity: [{ user: "olivia@aurora.com", action: "uploaded", note: "Uploaded the file" }]
    },
    {
      name: "Presentation.pptx",
      originalName: "Presentation.pptx",
      kind: "file",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      extension: "pptx",
      project: "Marketing Campaign Q3",
      uploadedBy: "william@aurora.com",
      sizeBytes: fs.statSync(assets.presentation).size,
      sizeLabel: formatBytes(fs.statSync(assets.presentation).size),
      storagePath: assets.presentation,
      description: "Campaign presentation deck for stakeholders.",
      sharedWith: ["emma@aurora.com", "mia@aurora.com", "ethan@aurora.com"],
      activity: [{ user: "william@aurora.com", action: "uploaded", note: "Uploaded the file" }]
    }
  ];

  await FileAsset.insertMany(
    fileDefs.map((file) => ({
      workspace: workspace._id,
      project: file.project ? projectMap[file.project]._id : null,
      uploadedBy: userMap[file.uploadedBy]._id,
      name: file.name,
      originalName: file.originalName,
      mimeType: file.mimeType,
      extension: file.extension,
      kind: file.kind,
      description: file.description,
      sharedWith: (file.sharedWith || []).map((email) => userMap[email]._id),
      sizeBytes: file.sizeBytes,
      sizeLabel: file.sizeLabel,
      storagePath: file.storagePath || "",
      activity: file.activity.map((activity) => ({
        user: userMap[activity.user]._id,
        action: activity.action,
        note: activity.note,
        createdAt: REFERENCE_DATE,
        updatedAt: REFERENCE_DATE
      }))
    }))
  );

  const conversationDefs = [
    {
      name: "Design Team",
      type: "group",
      about:
        "This channel is for all design discussions, feedback, and updates.",
      members: [
        "emma@aurora.com",
        "olivia@aurora.com",
        "sophia@aurora.com",
        "james@aurora.com",
        "william@aurora.com",
        "daniel@aurora.com"
      ],
      project: "Aurora Website Redesign"
    },
    {
      name: "James Park",
      type: "direct",
      about: "Direct chat with James.",
      members: ["emma@aurora.com", "james@aurora.com"]
    },
    {
      name: "Marketing Team",
      type: "group",
      about: "Campaign planning and launch coordination.",
      members: ["emma@aurora.com", "william@aurora.com", "mia@aurora.com", "ethan@aurora.com"],
      project: "Marketing Campaign Q3"
    },
    {
      name: "Project Alpha",
      type: "project",
      about: "General status updates for the active roadmap stream.",
      members: ["emma@aurora.com", "ava@aurora.com", "lucas@aurora.com"],
      project: "AI Workflow Automations"
    }
  ];

  const conversations = await Conversation.insertMany(
    conversationDefs.map((conversation) => ({
      workspace: workspace._id,
      name: conversation.name,
      type: conversation.type,
      about: conversation.about,
      project: conversation.project ? projectMap[conversation.project]._id : null,
      createdBy: userMap["emma@aurora.com"]._id,
      members: conversation.members.map((email) => userMap[email]._id),
      lastMessageAt: REFERENCE_DATE
    }))
  );

  const conversationMap = Object.fromEntries(
    conversations.map((conversation) => [conversation.name, conversation])
  );

  const messageDefs = [
    {
      conversation: "Design Team",
      sender: "olivia@aurora.com",
      body: "Hi team! Please review the latest designs for the dashboard. Would love your feedback.",
      attachments: [{ name: "Dashboard Design.fig", url: "", sizeLabel: "12.4 MB", type: "fig" }],
      createdAt: dateAt("2025-05-12T14:30:00.000Z")
    },
    {
      conversation: "Design Team",
      sender: "sophia@aurora.com",
      body: "Looks great! I really like the new layout. Just a small suggestion on the chart colors.",
      createdAt: dateAt("2025-05-12T14:32:00.000Z")
    },
    {
      conversation: "Design Team",
      sender: "james@aurora.com",
      body: "I agree with Sophia. The typography looks much better too.",
      createdAt: dateAt("2025-05-12T14:35:00.000Z")
    },
    {
      conversation: "Design Team",
      sender: "emma@aurora.com",
      body: "Thanks everyone! I'll update the colors and share the new version shortly.",
      createdAt: dateAt("2025-05-12T14:38:00.000Z")
    },
    {
      conversation: "Design Team",
      sender: "william@aurora.com",
      body: "Perfect! Let me know if you need any help.",
      reactions: [{ emoji: "👍", count: 1 }],
      createdAt: dateAt("2025-05-12T14:40:00.000Z")
    },
    {
      conversation: "James Park",
      sender: "james@aurora.com",
      body: "Sure, I'll update the task details.",
      createdAt: dateAt("2025-05-12T13:15:00.000Z")
    },
    {
      conversation: "Marketing Team",
      sender: "sophia@aurora.com",
      body: "Campaign assets are ready!",
      createdAt: dateAt("2025-05-11T16:10:00.000Z")
    },
    {
      conversation: "Project Alpha",
      sender: "emma@aurora.com",
      body: "Project deadline moved to May 30.",
      createdAt: dateAt("2025-05-09T15:00:00.000Z")
    }
  ];

  await Message.insertMany(
    messageDefs.map((message) => ({
      workspace: workspace._id,
      conversation: conversationMap[message.conversation]._id,
      sender: userMap[message.sender]._id,
      body: message.body,
      attachments: message.attachments || [],
      reactions: message.reactions || [],
      createdAt: message.createdAt,
      updatedAt: message.createdAt
    }))
  );

  for (const message of messageDefs) {
    await Conversation.findByIdAndUpdate(conversationMap[message.conversation]._id, {
      lastMessageAt: message.createdAt
    });
  }

  await Notification.insertMany([
    {
      workspace: workspace._id,
      user: userMap["emma@aurora.com"]._id,
      type: "task",
      title: "Task updated",
      message: "James updated the homepage task details.",
      link: "/tasks",
      read: false,
      createdAt: dateAt("2025-05-12T13:00:00.000Z")
    },
    {
      workspace: workspace._id,
      user: userMap["emma@aurora.com"]._id,
      type: "calendar",
      title: "Sprint review tomorrow",
      message: "Sprint review is scheduled for May 21 at 11:00 AM.",
      link: "/calendar",
      read: false,
      createdAt: dateAt("2025-05-12T12:00:00.000Z")
    },
    {
      workspace: workspace._id,
      user: userMap["emma@aurora.com"]._id,
      type: "mention",
      title: "New mention",
      message: "Olivia mentioned you in Design Team.",
      link: "/messages",
      read: false,
      createdAt: dateAt("2025-05-12T11:00:00.000Z")
    }
  ]);

  console.log("Seeded Aurora Workspace");

  return { seeded: true };
}
