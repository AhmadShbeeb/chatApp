const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Deta } = require('deta')
const deta = Deta(process.env.DETA_KEY)
const User = deta.Base('user')

const maxAge = 1 * 60 * 60
const generateAccessToken = key => jwt.sign({ key }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: maxAge }) // token max age

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Please add all fields!!')
  }
  const userExists = await User.fetch({ email })
  if (userExists?.count > 0) {
    res.status(400)
    throw new Error('User Already Exists!!')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.put({ name, email, password: hashedPassword })

  res.cookie('accessToken', generateAccessToken(user.key), { httpOnly: true, maxAge: maxAge * 1000 }) // cookie max age
  res.status(201).json({ user: user.key })
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const { count, items: user } = await User.fetch({ email })

  if (count == 0) {
    res.status(400)
    throw new Error("User Doesn't exists")
  }

  const correctPassword = await bcrypt.compare(password, user[0].password) // returns true if same

  if (!correctPassword) {
    res.status(400)
    throw new Error('Invalid Credentials!!')
  }

  res.cookie('accessToken', generateAccessToken(user[0].key), { httpOnly: true, maxAge: maxAge * 1000 }) // cookie max age
  res.status(200).json({ user: user[0].key })
})

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('accessToken')
  res.status(200).json({})
})

module.exports = { registerUser, loginUser, logoutUser }
