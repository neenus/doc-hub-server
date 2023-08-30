import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';


// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Create token and send response
      sendTokenResponse(user, 201, res);
    }
  } catch (error) {
    return next(error);
  };
};


// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password are provided
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  };

  // Check if user email exists in database
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  };

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  };

  // Create token and send response
  sendTokenResponse(user, 200, res);
};

export const logout = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }

  try {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      data: {},
    });

  } catch (error) {
    return next(error);
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create Token
  const token = user.getSignedJwtToken();

  // Create cookie options
  const options = {
    maxAge: process.env.JWT_COOKIE_EXPIRE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  // Send response
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      data: {
        user,
        token,
      },
    });
};