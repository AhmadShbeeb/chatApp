const asyncHandler = require('express-async-handler');

const registerUser = asyncHandler(async (req, res) => {
  res.json(req.body);
  console.log(req.body);
});

module.exports = { registerUser };
