const asyncHandler = require('express-async-handler');

const registerUser = asyncHandler(async (req, res) => {
  res.json(req.bodyy);
});

module.exports = { registerUser };
