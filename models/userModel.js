const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please a user must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have an email address'],
    unique: [true, 'Email address should be unique for each user'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide  valid email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead_guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user should have a password'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'A user should confirm the password to see they match'],
    validate: {
      // This only works on save nd create
      validator: function (ele) {
        return ele === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre('save', async function (next) {
  // Only run the function if password has been modified
  if (!this.isModified('password')) return next();
  //   Hash the password with cosr of 12
  this.password = await bcrypt.hash(this.password, 12);
  //   Delete the passwordConfrim field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 2000;
});

// Creating an instance method.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 100,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Methods to generate password reset tokens
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
