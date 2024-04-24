const express = require("express");
const passwordValidator = require("../middlewares/PasswordValidatorMW");
const passwordController = require("../controllers/PasswordController");

const router = express.Router();

router.post("/forgetPassword", passwordController.sendForgetPasswordLink);

router.post("/resetPassword", passwordController.resetPassword);

router.post("/reSendResetCode", passwordController.reSendResetCode);

router.post(
  "/changeToNewPassword",
  passwordValidator,
  passwordController.changeToNewPassword
);

module.exports = router;
