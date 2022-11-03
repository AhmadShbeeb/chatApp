const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
  },
  { timeStamps: true }
)

module.exports = mongoose.model('user', userSchema)
