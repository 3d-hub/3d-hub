const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const PrintCompletionSchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  printerId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  completionLog: {
    type: String,
    required: false,
  },
  context: {
    type: Object,
    required: false,
  },
});

const PrintCompletion = mongoose.model("PrintCompletion", PrintCompletionSchema);

module.exports = PrintCompletion;
