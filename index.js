/* eslint-disable node/no-missing-require */
// const { initializeApp } = require('firebase-admin/app')
// const { Telegraf } = require('telegraf')
// const fs = require('fs')
// const path = require('path')
// const morgan = require('morgan')
// const connectDB = require('./config/db')
const express = require('express')
var admin = require('firebase-admin')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')
const Pusher = require('pusher')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { errorHandler } = require('./middlewares/errorMiddleware')
const { protect } = require('./middlewares/authMiddleware')
require('dotenv').config()
require('colors')
require('./config/passport')
const app = express()
const port = process.env.PORT || 5000

const pusher = new Pusher({
  appId: process.env.PUSHER_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
})

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)),
  databaseURL: 'https://sinuous-env-357020.firebaseio.com',
})

const Slimbot = require('slimbot')
const slimbot = new Slimbot(process.env.BOT_TOKEN)
// slimbot.setWebhook({ url: 'https://chat-app-api.deta.dev/bot' })
// const bot = new Telegraf(process.env.BOT_TOKEN)
// slimbot.getWebhookInfo()
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
    origin: '*',
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

app.get('/chat', async (req, res) => {
  const { Deta } = require('deta') // import Deta
  const deta = Deta(process.env.DETA_KEY)
  const Chat = deta.Base('chat')

  const { items: chat } = await Chat.fetch()
  res.json([...chat])
})

// pusher.trigger('chat', 'message', { message: 'sup' })
app.post('/message', async (req, res) => {
  const { message, token } = req.body

  const { Deta } = require('deta') // import Deta
  const deta = Deta(process.env.DETA_KEY)
  const Chat = deta.Base('chat')

  const newMessage = await Chat.put({ from: 'fromKey', to: 'toKey', message })

  if (token) {
    const message2 = {
      data: {
        score: '850',
        time: '2:45',
      },
      token: token,
    }

    await getMessaging().send(message2)
  }

  await pusher.trigger('chat', 'message', message)
  res.json({ ...newMessage })
  // res.status(200).end('sent event successfully')
})

app.post('/delete-messages', async (req, res) => {
  const { Deta } = require('deta') // import Deta
  const deta = Deta(process.env.DETA_KEY)
  const Chat = deta.Base('chat')

  let allChat = await Chat.fetch()
  let allChatItems = allChat.items
  while (allChat.last) {
    allChat = await Chat.fetch({}, { last: allChat.last })
    allChatItems = allChatItems.concat(allChat.items)
  }

  for (let i = 0; i < allChatItems.length; i++) {
    await Chat.delete(allChatItems[i].key)
  }

  res.status(200).end('deleted successfully')
})

app.post('/bot', async (req, res, next) => {
  const { message } = req.body
  console.log('🚀 ~ file: index.js ~ line 113 ~ app.post ~ message', message)

  const { Deta } = require('deta') // import Deta
  const deta = Deta(process.env.DETA_KEY)
  const Chat = deta.Base('chat')

  const newMessage = await Chat.put({
    from: `${message.from.first_name} ${message.from.last_name}`,
    to: 'toKey',
    message: message.text,
  })

  slimbot.sendMessage(message.chat.id, newMessage.message)

  await pusher.trigger('chat', 'message', message.text)
  // slimbot.sendMessage(message.chat.id, message.text)
  // slimbot.sendMessage(175006751, 'Deta')
  // slimbot.startPolling()
  // slimbot.stopPolling()

  res.end()
})

app.use(errorHandler)

app.listen(8443, () => console.log(`> Server is running on port : ${port}`))

module.exports = app
