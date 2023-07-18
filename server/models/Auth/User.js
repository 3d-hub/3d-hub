const { model, Schema } = require("mongoose");

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  // Requiring password change means that the user will be redirected to the change password page
  // when they log in. The user will not be able to access any other page until they change their password.
  needsPasswordChange: {
    type: Boolean,
    default: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  roles: {
    type: Array,
    required: true,
  },
});

const User = model("User", UserSchema);

module.exports = User;
