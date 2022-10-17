const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timeStamps: true }
);

module.exports = mongoose.model('user', userSchema);
