export default {
  type: "object",
  properties: {
    amount: {
      type: "string",
      pattern: "^[0-9-+]"
    },
    sender: {
      type: "string",
      minimum: 6
    },
    recipient: {
      type: "string",
      minimum: 6
    }
  },
  required: ["amount", "sender", "recipient"]
};
