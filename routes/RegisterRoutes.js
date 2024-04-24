const express = require("express");
const registerController = require("../controllers/RegisterController");
const registerValidator = require("../middlewares/RegisterValidatorMW");
const emailController = require("../controllers/EmailController");

const router = express.Router();

router.post("/register", registerValidator, registerController.register);

router.post("/verify", emailController.verifyEmail);

router.post("/reSendCode", registerController.reSendCode);

module.exports = router;
