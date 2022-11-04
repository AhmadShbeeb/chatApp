const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { Deta } = require('deta')
const deta = Deta(process.env.DETA_KEY)
const User = deta.Base('user')
const RefreshToken = deta.Base('refresh_token')

const maxAge = 1 * 60 * 60
const generateAccessToken = key => jwt.sign({ key }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: maxAge }) // token max age
const generateRefreshToken = key => jwt.sign({ key }, process.env.REFRESH_TOKEN_SECRET)

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Please add all fields!!')
  }
  const userExists = await User.fetch({ email })
  if (userExists.count > 0) {
    res.status(400)
    throw new Error('User Already Exists!!')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser = await User.put({ name, email, password: hashedPassword })

  const refreshToken = generateRefreshToken(newUser.key)
  await RefreshToken.put({ token: refreshToken, user: newUser.key })

  res.cookie('accessToken', generateAccessToken(newUser.key), { httpOnly: true, maxAge: maxAge * 1000 }) // cookie max age
  res.status(201).json({ user: newUser.key, refreshToken })
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Please add all fields!!')
  }

  const userExists = await User.fetch({ email })

  if (userExists.count == 0) {
    res.status(400)
    throw new Error("User Doesn't exists")
  }

  const correctPassword = await bcrypt.compare(password, userExists.items[0].password) // returns true if same

  if (!correctPassword) {
    res.status(400)
    throw new Error('Invalid Credentials!!')
  }

  const refreshToken = generateRefreshToken(userExists.items[0].key)
  const previousUserToken = await RefreshToken.fetch({ user: userExists.items[0].key })

  if (previousUserToken.count > 0) {
    await RefreshToken.update({ token: refreshToken }, previousUserToken.items[0].key)
  } else {
    await RefreshToken.put({ token: refreshToken, user: userExists.items[0].key })
  }

  res.cookie('accessToken', generateAccessToken(userExists.items[0].key), { httpOnly: true, maxAge: maxAge * 1000 }) // cookie max age
  res.status(200).json({ user: userExists.items[0].key, refreshToken })
})

const logoutUser = asyncHandler(async (req, res) => {
  const { key } = req.user
  const previousUserTokens = await RefreshToken.fetch({ user: key })
  await RefreshToken.delete(previousUserTokens.items[0].key)

  // let allUserTokens = previousUserTokens.items
  // // continue fetching until last is not seen
  // while (previousUserTokens.last) {
  //   previousUserTokens = await RefreshToken.fetch({ user: key }, { last: previousUserTokens.last })
  //   allUserTokens = allUserTokens.concat(previousUserTokens.items)
  // }

  // for (let i = 0; i < allUserTokens.length; i++) {
  //   await RefreshToken.delete(allUserTokens[i].key)
  // }

  res.clearCookie('accessToken')
  res.status(200).json({ key })
})

const newAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    res.status(401)
    throw new Error('No Token')
  }

  const refreshTokenExists = await RefreshToken.fetch({ token: refreshToken })

  if (refreshTokenExists.count == 0) {
    res.status(403)
    throw new Error('Token not allowed')
  }

  // const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) // get user key from refresh token
  const accessToken = generateAccessToken(refreshTokenExists.items[0].user)

  res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: maxAge * 1000 }).send() // cookie max age
})

module.exports = { registerUser, loginUser, logoutUser, newAccessToken }
