const validator = require("../util/HostValidator");

module.exports = (req, res, next) => {
  let valid = validator(req.body);
  if (valid) {
    req.valid = 1;
    next();
  } else {
    if (validator.errors[0].instancePath == "/password")
      return res
        .status(403)
        .send(
          "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one digit."
        );
    if (validator.errors[0].instancePath == "/phoneNumber")
      return res.status(403).send("Invalid phone number format.");
  }
};
