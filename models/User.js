const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

let userSchema = new mongoose.Schema({
  fullName: String,
  id: {
    type: Number,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
  },
  gmail: {
    type: String,
    unique: true,
  },
  phoneNumber: String,
  isAdmin: Boolean,
  isHost: Boolean,
  password: String,
  birthDate: String,
  district: String,
  government: String,
  gender: String,
  verified: Boolean,
  stadiumName: String,
  isBlocked: Boolean,
});

userSchema.method("genAuthToken", function () {
  let token = jwt.sign(
    { userId: this._id, adminRole: this.isAdmin, hostRole: this.isHost },
    config.get("jwtsec")
  );
  return token;
});

let User = new mongoose.model("users", userSchema);

module.exports = User;
