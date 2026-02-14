const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpiry: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
