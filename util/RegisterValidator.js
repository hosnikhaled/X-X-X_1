const Ajv = require("ajv").default;

let schema = {
  type: "object",
  properties: {
    gmail: {
      type: "string",
      pattern: ".+@gmail\\.com",
    },
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
  required: ["username", "password", "phoneNumber", "gmail"],
};

const ajv = new Ajv();
module.exports = ajv.compile(schema);
