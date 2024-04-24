const config = require("config");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const UserVerification = require("../models/UserVerification");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.get("AUTH_EMAIL"),
    pass: config.get("AUTH_PASS"),
  },
});

transporter.verify((error) => {
  if (error) {
    console.log(error);
  }
});

module.exports.sendVerificationEmail = async ({ _id, gmail }, res) => {
  try {
    // if user verfication exist, we need to delete it before create new one
    let userVer = await UserVerification.findOne({ _id });
    if (userVer) {
      await UserVerification.findOneAndDelete({ _id });
    }

    let verCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const newrVerification = new UserVerification({
      userId: _id,
      code: verCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 21600000 => 6 hours
    });
    await newrVerification.save();
    setTimeout(async () => {
      try {
        await UserVerification.deleteOne({ userId: _id });
        let user = await User.findOne({ _id });
        if (!user.verified) {
          await User.deleteOne({ _id });
        }
      } catch (err) {
        console.log(err);
      }
    }, 3600000);
    const mailOptions = {
      from: config.get("AUTH_EMAIL"),
      to: gmail,
      subject: "Verify Your Email",
      html: `
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

        <img src="https://yourapp.com/logo.png" alt="YourApp Logo" style="width: 100%; max-height: 150px; object-fit: cover; border-bottom: 1px solid #e0e0e0; padding: 20px 0;">

        <div style="padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to YourApp!</h2>
          <p style="font-size: 16px; color: #555; margin-bottom: 20px;">Thank you for signing up! To complete the registration process, please verify your email address.</p>
          <p>This verification code <b>expires in 1 hour</b>.</p>
          <p style="font-size: 36px; font-weight: bold; color: #007bff; margin-bottom: 20px;">${verCode}</p>
        </div>

        <p style="font-size: 14px; color: #888; margin-top: 20px;">If you didn't sign up for YourApp, you can ignore this email.</p>
      </div>
    </div>
  `,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).send("Verification email sent.");
  } catch (error) {
    res
      .status(500)
      .send(
        `An error occurred while processing email data... ${error.message}`
      );
  }
};

module.exports.verifyEmail = async (req, res) => {
  try {
    let gmail = req.body.gmail;
    let code = req.body.code;
    let user = await User.findOne({ gmail });
    let userId = user._id;
    const result = await UserVerification.findOne({ userId });
    // we don't check about expire date because it remove auto from DB
    if (result) {
      // Valid record exists, validate the user code
      // Compare the codes
      if (code == result.code) {
        // code match, update user record
        await User.updateOne({ _id: userId }, { verified: true });
        await UserVerification.deleteOne({ userId });
        res.status(200).send("Email has been verified...");
      } else {
        let msg = "Invalid verification code passed. Check your inbox.";
        res.send(msg);
      }
    } else {
      let msg =
        "Email has been verified already or Code has been expired, sign up again....";
      res.send(msg);
    }
  } catch (error) {
    let msg = "An error occurred during the verification process.";
    res.status(500).send(`${msg + error}`);
  }
};

module.exports.sendResetPassword = async ({ _id, gmail }, res) => {
  try {
    let userVer = await UserVerification.findOne({ _id });
    if (userVer) {
      await UserVerification.findOneAndDelete({ _id });
    }

    let verCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const newrVerification = new UserVerification({
      userId: _id,
      code: verCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 21600000 => 6 hours
    });
    await newrVerification.save();
    setTimeout(async () => {
      try {
        await UserVerification.deleteOne({ userId: _id });
      } catch (err) {
        console.log(err);
      }
    }, 3600000);
    const mailOptions = {
      from: config.get("AUTH_EMAIL"),
      to: gmail,
      subject: "Reset Your Password",
      html: `
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

        <img src="https://yourapp.com/logo.png" alt="YourApp Logo" style="width: 100%; max-height: 150px; object-fit: cover; border-bottom: 1px solid #e0e0e0; padding: 20px 0;">

        <div style="padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to YourApp!</h2>
          <p style="font-size: 16px; color: #555; margin-bottom: 20px;">We received a request to reset your password.</p>
          <p>This reset code <b>expires in 1 hour</b>.</p>
          <p style="font-size: 16px; color: #555; margin-bottom: 20px;">the following password reset code: </p>
          <p style="font-size: 36px; font-weight: bold; color: #007bff; margin-bottom: 20px;">${verCode}</p>
        </div>

        <p style="font-size: 14px; color: #888; margin-top: 20px;">If you didn't reset your password for YourApp, you can ignore this email.</p>
      </div>
    </div>
  `,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).send("Verification email sent.");
  } catch (error) {
    res
      .status(500)
      .send(
        `An error occurred while processing email data... ${error.message}`
      );
  }
};

module.exports.sendChangeEmailVerfication = async (req, res) => {
  let user = await User.findOne({ _id: req._id });
  if (!user) {
    return res.status(404).send("User Not Found...");
  }

  const token = req.token;
  const queryString = Object.keys(req.body)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(req.body[key])}`
    )
    .join("&");
  const link = `http://localhost:3000/api/guest/sendToSecondEmail/${user._id}/${token}/${req.body.gmail}?${queryString}`;

  const mailOptions = {
    from: config.get("AUTH_EMAIL"),
    to: user.gmail,
    subject: "Change Your Gmail",
    html: `
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

        <img src="https://yourapp.com/logo.png" alt="YourApp Logo" style="width: 100%; max-height: 150px; object-fit: cover; border-bottom: 1px solid #e0e0e0; padding: 20px 0;">

        <div style="padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to YourApp!</h2>
          <p style="font-size: 16px; color: #555; margin-bottom: 20px;">Thank you for signing up! To complete the registration process, please verify your email address.</p>
          <p>This verification link <b>expires in 1 hour</b>.</p>
          
          <a href="${link}" style="display: inline-block; padding: 15px 30px; font-size: 16px; text-decoration: none; background-color: #007BFF; color: #fff; border-radius: 5px; margin-top: 20px;">Verify Now</a>
        </div>

        <p style="font-size: 14px; color: #888; margin-top: 20px;">If you didn't sign up for YourApp, you can ignore this email.</p>
      </div>
    </div>
  `,
  };

  await transporter.sendMail(mailOptions);
  res.status(200).send("Email has been sent....");
};

module.exports.sendToSecondEmail = async (req, res) => {
  const { _id, token, gmail } = req.params;
  const data = req.query;
  let user = await User.findOne({ _id });
  if (!user) {
    return res.status(404).send("User Not Found...");
  }
  let secretKey = config.get("jwtsec") + user.gmail;
  try {
    jwt.verify(token, secretKey);
  } catch (error) {
    console.log(error);
    return res.status(404).send("Link has been expired...");
  }
  const queryString = Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&");
  const link = `http://localhost:3000/api/guest/changeEmail/${user._id}/${token}/${gmail}/?${queryString}`;

  const mailOptions = {
    from: config.get("AUTH_EMAIL"),
    to: gmail,
    subject: "Verify Your Email",
    html: `
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

        <img src="https://yourapp.com/logo.png" alt="YourApp Logo" style="width: 100%; max-height: 150px; object-fit: cover; border-bottom: 1px solid #e0e0e0; padding: 20px 0;">

        <div style="padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to YourApp!</h2>
          <p style="font-size: 16px; color: #555; margin-bottom: 20px;">Thank you for signing up! To complete the registration process, please verify your email address.</p>
          <p>This verification link <b>expires in 1 hour</b>.</p>
          
          <a href="${link}" style="display: inline-block; padding: 15px 30px; font-size: 16px; text-decoration: none; background-color: #007BFF; color: #fff; border-radius: 5px; margin-top: 20px;">Verify Now</a>
        </div>

        <p style="font-size: 14px; color: #888; margin-top: 20px;">If you didn't sign up for YourApp, you can ignore this email.</p>
      </div>
    </div>
  `,
  };
  await transporter.sendMail(mailOptions);
  res.status(200).send("Second Email has been sent....");
};

module.exports.changeEmail = async (req, res) => {
  const { _id, token, gmail } = req.params;
  const data = req.query;

  let user = await User.findOne({ _id });
  if (!user) {
    return res.status(404).send("User Not Found...");
  }
  let secretKey = config.get("jwtsec") + user.gmail;
  try {
    jwt.verify(token, secretKey);
  } catch (error) {
    console.log(error);
    return res.status(404).send("Link has been expired...");
  }
  let host = await User.findOneAndUpdate(
    { _id, isHost: false, isAdmin: false },
    data,
    {
      returnOriginal: false,
    }
  );
  if (!host) return res.status(404).send("User Not Found...");
  res.send("Data Has Been Changed");
};
