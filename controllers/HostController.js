const User = require("../models/User");
const bcrypt = require("bcrypt");
const emailController = require("./EmailController");
const config = require("config");
const jwt = require("jsonwebtoken");

module.exports.addHost = async (req, res) => {
  let IsExist = await User.findOne({ username: req.body.username });
  if (IsExist) {
    return res.status(400).send("username is already exist...");
  }
  let { username, password, fullName, phoneNumber, stadiumName } = req.body;
  const salt = 10;
  password = await bcrypt.hash(password, salt);
  let host = new User({
    username,
    password,
    fullName,
    phoneNumber,
    stadiumName,
  });
  let users = await User.find({});
  host.isHost = true;
  host.isAdmin = false;
  host.isBlocked = false;
  host.verified = true;
  host.gmail = username;
  host.id = users.length + 1;
  host
    .save()
    .then(() => {
      res.status(200).send("New admin is added...");
    })
    .catch((err) => {
      res.status(400).send(err.message);
    });
};

module.exports.getAllHosts = async (req, res) => {
  let hosts = await User.find({ isHost: true });
  res.json(hosts);
};

module.exports.editHost = async (req, res) => {
  try {
    let msg = "";
    if (req.body.gmail != undefined) {
      let host = await User.findOne({ _id: req.params.hostId });
      if (!host) return res.status(404).send("User Not Found...");
      req.body.gmail = host.username;
      msg = " ,There Is No Email To Change...";
    }

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

    let host = await User.findOneAndUpdate(
      { _id: req.params.hostId, isHost: true, isAdmin: false },
      req.body,
      {
        returnOriginal: false,
      }
    );
    if (!host) return res.status(404).send("User Not Found...");
    res.send(`Data Is Updated...${msg}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error While Updating...");
  }
};

module.exports.deleteHost = async (req, res) => {
  try {
    let host = await User.findOneAndDelete({
      _id: req.params.hostId,
      isHost: true,
      isAdmin: false,
    });
    if (!host) return res.status(404).send("User Not Found...");
    res.send("Host is deleted...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error While Deleting Host...");
  }
};

module.exports.blockHost = async (req, res) => {
  let host = await User.findOneAndUpdate(
    { _id: req.params.hostId, isHost: true },
    { isBlocked: true },
    {
      returnOriginal: false,
    }
  );
  if (!host) return res.status(404).send("User Not Found...");
  res.json(host);
};
