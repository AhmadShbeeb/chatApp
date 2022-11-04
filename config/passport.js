const passport = require('passport')
require('dotenv').config()
const { Deta } = require('deta') // import Deta
const deta = Deta(process.env.DETA_KEY)
const User = deta.Base('user')

const { Strategy, ExtractJwt } = require('passport-jwt')

const cookieExtractor = req => {
  let token = null
  if (req && req.cookies) token = req.cookies['accessToken']
  return token
}

const options = {
  // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
}

passport.use(
  'jwt',
  new Strategy(options, async (jwt_payload, done) => {
    const user = await User.get(jwt_payload.key)
    try {
      if (user) {
        user.password = undefined
        // const { password, ...userWithoutPassword } = user
        return done(null, user) // attaches the found user to the req object
      } else {
        return done(null, false, { message: 'User not found' })
      }
    } catch (error) {
      return done(error, false)
    }
  })
)
