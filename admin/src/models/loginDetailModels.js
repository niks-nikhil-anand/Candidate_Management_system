import mongoose from "mongoose";

const loginDetailSchema = new mongoose.Schema(
  {
    loginDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    loginTime: {
      type: String,
      default: () => new Date().toLocaleTimeString(),
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalLogins: {
      type: Number,
      default: 0,
    },
    device: {
      type: String,
      enum: ["Desktop", "Mobile", "Tablet", "Other"],
      default: "Desktop",
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    os: {
      type: String,
      required: false,
    },
    platform: {
      type: String,
      required: false,
    },
    browser: {
      type: String,
      required: false,
    },
    browserVersion: {
      type: String,
      required: false,
    },
    engine: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LoginDetail ||
  mongoose.model("LoginDetail", loginDetailSchema);
