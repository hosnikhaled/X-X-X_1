const User = require("../models/User");
const bcrypt = require("bcrypt");
const emailController = require("./EmailController");
const config = require("config");
const jwt = require("jsonwebtoken");
const loginController = require("./LoginController");

module.exports.editGuest = async (req, res) => {
  if (req.body.username != undefined) {
    let user = await User.find({ username: req.body.username });
    if (user.length > 0) {
      return res.status(400).send("Username is already exist");
    }
  }

  if (req.body.password != undefined) {
    let salt = 10;
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  if (req.body.gmail != undefined) {
    let user = await User.find({ gmail: req.body.gmail });
    if (user.length > 0) {
      return res.status(400).send("Gmail is already exist");
    }
    user = await User.findOne({ _id: req.params.guestId });
    if (!user) {
      return res.status(404).send("User Not Found");
    }
    let secretKey = config.get("jwtsec") + user.gmail;
    const token = jwt.sign({ gmail: user.gmail, _id: user._id }, secretKey, {
      expiresIn: "60m",
    });
    req.token = token;
    req._id = req.params.guestId;
    return await emailController.sendChangeEmailVerfication(req, res);
  }

  let host = await User.findOneAndUpdate(
    { _id: req.params.guestId, isHost: false, isAdmin: false },
    req.body,
    {
      returnOriginal: false,
    }
  );
  if (!host) return res.status(404).send("User Not Found...");
  res.send("Data Is Updated..");
};

module.exports.getAllGuests = async (req, res) => {
  let users = await User.find({ isAdmin: false, isHost: false });
  if (users.length == 0) return res.status(404).send("There Is No Guests");
  res.json(users);
};

module.exports.blockGuest = async (req, res) => {
  let guest = await User.findOneAndUpdate(
    { _id: req.params.guestId, isHost: false, isAdmin: false },
    { isBlocked: true },
    {
      returnOriginal: false,
    }
  );
  if (!guest) return res.status(404).send("User Not Found...");
  res.json(guest);
};

module.exports.deleteGuest = async (req, res) => {
  try {
    let guest = await User.findOneAndDelete({
      _id: req.params.guestId,
      isHost: false,
      isAdmin: false,
    });
    if (!guest) return res.status(404).send("User Not Found...");
    res.send("Guest is deleted...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error While Deleting Guest...");
  }
};
