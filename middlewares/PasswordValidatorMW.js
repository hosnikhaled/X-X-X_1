const validator = require("../util/PasswordValidator");

module.exports = (req, res, next) => {
  let valid = validator(req.body);
  if (valid) {
    req.valid = 1;
    next();
  } else {
    return res
      .status(403)
      .send(
        "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one digit."
      );
  }
};
