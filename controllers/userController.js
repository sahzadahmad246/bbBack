const User = require("./../models/userModel");
const catchAsyncErrors = require("./../middlewares/catchAsyncError");
const ErrorHandler = require("./../utilis/errorHandler");
const sendToken = require("./../utilis/jwtToken");

// Sign User
exports.userSignup = catchAsyncErrors(async (req, res, next) => {
  const { displayName, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(
      new ErrorHandler("User with this phone number already exists", 400)
    );
  }

  const user = await User.create({ displayName, email, password });

  sendToken(user, 201, res);
});

// Login user
exports.userLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

// Load logged-in user
exports.getLoggedInUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Not logged in", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});
