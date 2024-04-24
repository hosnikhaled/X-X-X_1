const User = require("../models/User");
const config = require("config");
const bcrypt = require("bcrypt");
const emailController = require("./EmailController");

module.exports.login = async (req, res) => {
  try {
    let user = await User.findOne({}).or([
      { username: req.body.username },
      { gmail: req.body.gmail },
    ]);
    if (!user) {
      return res
        .status(400)
        .send("username or gmail or phone number is not exist...");
    }
    let passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      return res.status(400).send("Incorrect password...");
    }

    if (!user.verified) {
      return emailController.sendVerificationEmail(user, res);
      // return res.status(400).send("Your Account Need To Verified...");
    }

    if (user.isBlocked) {
      return res.status(400).send("Your Account Has Been Blocked...");
    }

    if (!config.get("jwtsec"))
      return res
        .status(500)
        .send("Request can't be fullfilled.. Token is not defiend");
    let token = user.genAuthToken();
    res.setHeader("x-auth-header", token);
    let status = "Success";
    // res.send("Login Success");
    res.json({
      status,
      user,
      token,
    });
  } catch (error) {
    res.status(500).send("Server Error...");
  }
};
