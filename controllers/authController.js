const { promisify } = require('util'); // built in node module
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if the user exists and if the password is correct
  const user = await User.findOne({ email }).select('+password'); // use of + is because select is set to false by defualt in schema

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or passowrd', 401));
  }
  // If everything is okay, send the password.
  const token = signToken(user._id);
  res.status(200).json({
    ststus: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in!. Please log in to get access', 401)
    );
  }

  // 2. Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3. Check if user still exist

  // 4. Chexk if user changed password after token was issued

  next();
});
