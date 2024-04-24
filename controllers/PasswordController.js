const User = require("../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");
const emailController = require("./EmailController");
let UserVerification = require("../models/UserVerification");

module.exports.sendForgetPasswordLink = async (req, res) => {
  try {
    let user = await User.findOne({ gmail: req.body.gmail });
    if (!user) return res.status(404).send("User Not Found...");
    if (!user.verified) {
      return res.status(400).send("You need to verify your account first...");
    }
    emailController.sendResetPassword(user, res);
  } catch (error) {
    res.status(500).send(`Server Error.... ${error.message}`);
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    let user = await User.findOne({ gmail: req.body.gmail });

    if (!user) return res.status(404).send("User Not Found...");

    let userVerification = await UserVerification.findOne({ userId: user._id });
    if (!userVerification)
      return res.status(404).send("Verification code has been expired...");
    if (req.body.code == userVerification.code) {
      const salt = 10;
      req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);
      await User.findOneAndUpdate(
        { gmail: req.body.gmail },
        { password: req.body.newPassword },
        { returnOriginal: false }
      );
      await UserVerification.findOneAndDelete({ userId: user._id });
      return res.send("Your password has been updated...");
    }
    res.status(400).send("Incorrect code...");
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
};

module.exports.reSendResetCode = async (req, res) => {
  try {
    let gmail = req.body.gmail;
    let user = await User.findOne({ gmail });
    if (!user) return res.status(404).send("User Not Found...");
    await UserVerification.deleteOne({ userId: user._id });
    emailController.sendResetPassword(user, res);
  } catch (error) {
    let msg = "An error occurred during the re-send verification code.";
    res.status(500).send(`${msg + error}`);
  }
};

module.exports.changeToNewPassword = async (req, res) => {
  try {
    let gmail = req.body.gmail;
    let password = req.body.password;
    let user = await User.findOne({ gmail });
    if (!user) return res.status(404).send("User Not Found...");
    let userVerification = await UserVerification.findOne({ userId: user._id });
    if (!userVerification)
      return res.status(404).send("Verification code has been expired...");
    if (userVerification.expiresAt > Date.now) {
      let hashedPassword = await bcrypt.hash(password, 10);
      await User.findOneAndUpdate({ gmail }, { password: hashedPassword });
      await UserVerification.deleteOne({ userId: user._id });
      res.status(200).send("Email has been verified...");
    } else res.status(400).send("Verification code has been expired...");
  } catch (error) {
    let msg = "An error occurred during re-set password.";
    res.status(400).send(msg + error);
  }
};
