const mongoose = require('mongoose');
const validator = require('validator');
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
  password: {
    type: String,
    required: [true, 'A user should have a password'],
    minlength: 8,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'A user should confirm the password to see they match'],
  },
});

\
const User = mongoose.model('User', userSchema)

module.exports = User;