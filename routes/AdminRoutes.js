const express = require("express");
const hostController = require("../controllers/HostController");
const guestController = require("../controllers/GuestController");
const registerController = require("../controllers/RegisterController");
const registerValidator = require("../middlewares/RegisterValidatorMW");
const stadiumController = require("../controllers/StadiumController");
const upload = require("../middlewares/UploadMW");
const hostValidator = require("../middlewares/HostValidatorMW");

const router = express.Router();

router.post("/addHost", hostValidator, hostController.addHost);

router.post("/addGuest", registerValidator, registerController.register);

router.post(
  "/addStadium",
  upload.array("photos"),
  stadiumController.addStadium
);

router.get("/getAllHosts", hostController.getAllHosts);

router.get("/getAllGuests", guestController.getAllGuests);

router.put("/editHost/:hostId", hostController.editHost);

router.put("/editGuest/:guestId", guestController.editGuest);

router.put("/blockHost/:hostId", hostController.blockHost);

router.put("/blockGuest/:guestId", guestController.blockGuest);

router.delete("/deleteHost/:hostId", hostController.deleteHost);

router.delete("/deleteGuest/:guestId", guestController.deleteGuest);

// http://localhost:3000/api/admin/changeEmail/${user._id}/${token}

module.exports = router;
