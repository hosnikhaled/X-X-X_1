const Ajv = require("ajv").default;

let hostSchema = {
  type: "object",
  properties: {
    username: {
      type: "string",
    },
    password: {
      type: "string",
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
    },
    phoneNumber: {
      type: "string",
      pattern: "^01\\d{9}$",
    },
  },
  required: ["username", "password", "phoneNumber"],
};

const ajv = new Ajv();
module.exports = ajv.compile(hostSchema);
