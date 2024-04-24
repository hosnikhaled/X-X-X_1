const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFilename);

    // let date = Date.now();
    // console.log(date);
    // cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  // fileFilter: function (req, file, cb) {
  //   if (file.mimetype == "image/png" || file.mimetype == "image/jpg") {
  //     cb(null, true);
  //   } else {
  //     console.log("Only png and jpg are supported...");
  //     cb(null, false);
  //   }
  // },
  // limits: {
  //   fieldSize: 1024 * 1024 * 2,
  // },
});

module.exports = upload;
