import ErrorResponse from '../utils/errorResponse.js';
import Key from "../models/Key.js";
import { sendSecureLink, sendOtp } from "../utils/mailer.js";
import crypto from "crypto";

// @route   POST /api/v1/key
// @desc    Generate secure link
// @access  Private
export const generateLink = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorResponse("Email is required", 400));

  const key = crypto.randomBytes(20).toString("hex");

  try {
    const newKey = await Key.create({
      key,
      email,
    });


    if (newKey) {
      if (process.env.NODE_ENV === "production") await sendSecureLink(email, key);

      return res.status(200).json({
        success: true,
        data: {
          key: newKey.key,
          email: newKey.email,
        },
      });
    }
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};

// @route   POST /api/v1/key/otp
// @desc    Request OTP
// @access  Private
export const requestOtp = async (req, res, next) => {
  const { key } = req.body;
  console.log(key);
  const keyEntry = await Key.findOne({ key });

  // Check if key is valid and not expired
  if (!keyEntry || keyEntry.expiresAt < Date.now())
    return next(new ErrorResponse("Invalid or expired key", 400));

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Reset OTP and expiry time
  const otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  keyEntry.otp = otp;
  keyEntry.otpExpiresAt = otpExpiresAt;
  await keyEntry.save();

  // Send OTP to user
  if (process.env.NODE_ENV === "production") await sendOtp(keyEntry.email, otp);

  return res.status(200).json({
    success: true,
    data: {
      message: "OTP sent successfully",
      email: keyEntry.email,
      key: keyEntry.key,
      otp,
    },
  });
};

// @route   POST /api/v1/key/verify
// @desc    Verify Code and Key
// @access  Private
export const verifyOtp = async (req, res, next) => {
  const { key, otp } = req.body;
  const keyEntry = await Key.findOne({ key, otp });
  const now = Date.now();

  console.log({ keyEntry });
  console.log("OPT Expired: ", Date.parse(keyEntry.otpExpiresAt) < Date.parse(now) ? "Yes" : "No");

  // Check if OTP is expired
  if (!keyEntry || Date.parse(keyEntry.otpExpiresAt) < Date.parse(now))
    return next(new ErrorResponse("Invalid or expired OTP", 400));

  // Reset OTP and expiry time
  keyEntry.otp = "";
  keyEntry.otpExpiresAt = "";
  await keyEntry.save();

  return res.status(200).json({
    success: true,
    data: {
      message: "Key verified successfully",
    },
  });
};

// @route   POST /api/v1/key/cleanup
// @desc    Cleanup expired OTPs
// @access  Private
export const cleanupOtp = async (req, res, next) => {
  try {
    // Remove expired OTPs
    await Key.updateMany(
      { otpExpiresAt: { $lt: Date.now() } },
      { $unset: { otp: "", otpExpiresAt: "" } }
    );

    return res.status(200).json({
      success: true,
      message: "Expired OTPs cleaned up successfully",
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};
