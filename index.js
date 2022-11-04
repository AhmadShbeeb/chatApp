const express = require('express')
// const fs = require('fs')
// const path = require('path')
const helmet = require('helmet')
// const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
// const connectDB = require('./config/db')
const { errorHandler } = require('./middlewares/errorMiddleware')
const { protect } = require('./middlewares/authMiddleware')
require('dotenv').config()
require('colors')
require('./config/passport')
const app = express()
const port = process.env.PORT || 5000

// connectDB()

// create a write stream (in append mode)
// var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// setup the logger
// app.use(morgan('combined', { stream: accessLogStream }))

// app.use(morgan('tiny'))
app.use(
  cors({
    // origin: 'http://127.0.0.1:3000', // the blocked external client origin that's differen from the one that has the same server
    // methods: ['GET', 'POST'], // allowed options
    // origin: true,
    // allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    credentials: true, // for cookies
  })
)

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/users', require('./routes/userRoutes'))

app.post('/fill', async (req, res, next) => {
  const { Deta } = require('deta') // import Deta
  const deta = Deta(process.env.DETA_KEY)
  const user = await deta.Base('user').put({ name: 'ahmad', email: 'qwe@', password: '123' })
  const chat = await deta.Base('chat').put({ from: 'key', to: 'key', message: 'hi' })
  const refresh_token = await deta.Base('refresh_token').put({ token: 'qwer' })
  res.json({ user, chat, refresh_token })
})

app.get('/chats', protect, async (req, res) => {
  const { Deta } = require('deta') // import Deta
  const deta = Deta(process.env.DETA_KEY)
  const Chat = deta.Base('chat')

  const chats = await Chat.put({ from: req.user.key, to: 'key', message: req.body.message })
  res.json({ chats })
})

app.post('/passport', protect, (req, res) => {
  res.json(req.user)
})

app.get('/co', (req, res) => {
  // res
  // .cookie('a', 1, { httpOnly: false, sameSite: 'none', secure: true })
  // .cookie('b', 2, { httpOnly: false, sameSite: 'none', secure: true })
  // res.cookie('b', 2, { httpOnly: false })
  // res.send()
  // res.header('Access-Control-Allow-Headers', '*')
  // res.append('Set-Cookie', ['a=1; Path=/; HttpOnly', 'b=2; Path=/; HttpOnly'])
  // res.append('multiValueHeaders', 'Set-Cookie': ['cookie1=1', 'cookie2=2'])
  // res.send()
  res.header('Set-Cookie', ['cookie1=1', 'cookie2=2']).send()
})

app.use(errorHandler)

app.listen(port, () => console.log(`> Server is running on port : ${port}`))

module.exports = app
