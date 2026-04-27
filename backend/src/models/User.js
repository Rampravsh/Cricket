/**
 * @module models/User
 * @description Mongoose schema and model for User.
 * This model stores user identity from Google, along with system flags and denormalized statistics.
 */
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
  {
    // --- Identity ---
    provider: {
      type: String,
      enum: ['google'],
      required: true,
      default: 'google',
    },
    providerId: {
      type: String,
      required: [true, 'Provider ID is required'],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    avatar: {
      type: String,
      default: null,
    },

    // --- System ---
    isVerified: {
      type: Boolean,
      default: true, // Google users are verified by default
    },
    deviceIds: {
      type: [String],
      default: [],
    },

    // --- Stats (denormalized for fast reads) ---
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesCreated: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      lastUpdatedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
