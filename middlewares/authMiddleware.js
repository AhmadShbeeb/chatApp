// const asyncHandler = require('express-async-handler')
// const jwt = require('jsonwebtoken')
// require('dotenv').config()
// const { Deta } = require('deta')
// const deta = Deta(process.env.DETA_KEY)
// const User = deta.Base('user')

// const protect = asyncHandler(async (req, res, next) => {
//   let token
//   if (req.headers?.authorization?.startsWith('Bearer')) {
//     try {
//       // get token from header
//       token = req.headers.authorization.split(' ')[1]

//       // verify token
//       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // to get the payload data

//       // get user from token(which has the user id)
//       req.user = await User.get(decoded.key)

//       next()
//     } catch (error) {
//       console.log(error)
//       res.status(401) // not authorized
//       throw new Error('Not authorized, expired token')
//     }
//   }

//   if (!token) {
//     res.status(401)
//     throw new Error('Not authorized, no token')
//   }
// })

const passport = require('passport')
const protect = passport.authenticate('jwt', { session: false })

module.exports = { protect }
