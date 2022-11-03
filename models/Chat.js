const mongoose = require('mongoose')
const chatSchema = mongoose.Schema({
  name: {
    type: String,
    default: 'default txt',
  },
})
module.exports = mongoose.model('chat', chatSchema)
