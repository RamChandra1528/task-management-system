import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema(
  {
    defaultTaskView: {
      type: String,
      enum: ["board", "list"],
      default: "board"
    },
    tasksPerPage: {
      type: Number,
      default: 25
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light"
    },
    compactMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: "English"
    },
    timezone: {
      type: String,
      default: "(GMT-05:00) Eastern Time"
    },
    dateFormat: {
      type: String,
      default: "MM/DD/YYYY"
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      assignments: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      },
      projectUpdates: {
        type: Boolean,
        default: false
      }
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member"
    },
    jobTitle: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    location: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: ""
    },
    department: {
      type: String,
      default: ""
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    presence: {
      type: String,
      enum: ["online", "away", "offline"],
      default: "online"
    },
    avatar: {
      bg: {
        type: String,
        default: "linear-gradient(135deg, #c4b5fd 0%, #7c3aed 100%)"
      },
      text: {
        type: String,
        default: "#ffffff"
      }
    },
    permissions: {
      type: [String],
      default: []
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function onSave(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);
