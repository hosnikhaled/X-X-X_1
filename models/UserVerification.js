const mongoose = require("mongoose");

let userVerificationSchema = new mongoose.Schema({
  userId: String,
  code: Number,
  createdAt: Date,
  expiresAt: Date,
});

let UserVerification = new mongoose.model(
  "usersverification",
  userVerificationSchema
);

module.exports = UserVerification;
