const User = require("../models/User");
const bcrypt = require("bcrypt");
const emailController = require("./EmailController");
const UserVerification = require("../models/UserVerification");

module.exports.register = async (req, res) => {
  let IsExist = await User.find({}).or([
    { username: req.body.username },
    { gmail: req.body.gmail },
  ]);
  if (IsExist.length > 0) {
    return res.status(400).send("username or gmail is already exist...");
  }

  let {
    fullName,
    username,
    gmail,
    phoneNumber,
    password,
    birthDate,
    district,
    government,
    gender,
  } = req.body;

  let user = new User({
    fullName,
    username,
    gmail,
    phoneNumber,
    password,
    birthDate,
    district,
    government,
    gender,
  });
  let users = await User.find({});
  user.id = users.length + 1;
  user.isAdmin = false;
  user.verified = false;
  user.isHost = false;
  user.isBlocked = false;
  user.stadiumName = null;
  const salt = 10;
  // Hash function takes data as first paramter and
  // Salt rounds as second paramter or may take salt as string
  user.password = await bcrypt.hash(user.password, salt);
  user
    .save()
    .then((result) => {
      emailController.sendVerificationEmail(result, res);
    })
    .catch((err) => {
      res.status(400).send(err.message);
    });
};

module.exports.reSendCode = async (req, res) => {
  try {
    let gmail = req.body.gmail;
    let user = await User.findOne({ gmail });
    if (!user) return res.status(404).send("User Not Found...");
    await UserVerification.deleteOne({ userId: user._id });
    emailController.sendVerificationEmail(user, res);
  } catch (error) {
    let msg = "An error occurred during the re-send verification code.";
    res.status(500).send(`${msg + error}`);
  }
};
