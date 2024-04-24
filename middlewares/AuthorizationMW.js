const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  // get x-auth-token header
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).send("Forbidden-You need to login first...");
  try {
    // get data from token
    const decodedPayload = jwt.verify(token, config.get("jwtsec"));
    // check admin role
    if (!decodedPayload.adminRole)
      return res.status(401).send("Forbidden-Access Denied..");
    next();
  } catch (error) {
    res.status(400).send("Invalid Token..");
  }
};
