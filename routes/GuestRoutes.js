const guestController = require("../controllers/GuestController");
const emailController = require("../controllers/EmailController");

const express = require("express");

const router = express.Router();

router.put("/editGuest/:guestId", guestController.editGuest);

router.get(
  "/sendToSecondEmail/:_id/:token/:gmail",
  emailController.sendToSecondEmail
);

// http://localhost:3000/api/admin/changeEmail/${user._id}/${token}/${gmail}

router.get("/changeEmail/:_id/:token/:gmail", emailController.changeEmail);

module.exports = router;
