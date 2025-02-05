import mongoose from "mongoose";

const KeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Please add a token"],
      unique: true
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Please add a valid email"]
    },
    otp: {
      type: String
    },
    otpExpiresAt: {
      type: Date,
      default: Date.now() + 5 * 60 * 1000 // 5 minutes
    },
    expiresAt: {
      type: Date,
      default: Date.now() + 14 * 24 * 60 * 60 * 1000 // 14 days
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model("Key", KeySchema);