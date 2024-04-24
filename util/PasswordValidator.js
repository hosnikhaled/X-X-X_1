const Ajv = require("ajv").default;

let schema = {
  type: "object",
  properties: {
    password: {
      type: "string",
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
    },
  },
  required: ["password"],
};

const ajv = new Ajv();
module.exports = ajv.compile(schema);
