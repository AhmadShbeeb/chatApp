const { Worker } = require('worker_threads')
require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

// app.get('/', (req, res) => {
//   res.json('Hello World!')
// })

console.log(process.env.PORT)
let counter = 0
app.get('/sh', (req, res, next) => {
  counter++
  res.status(200).json(`counter ${counter}`)
})

app.get('/lg', (req, res) => {
  const worker = new Worker('./worker.js', { workerData: 55 })
  worker.on('message', data => {
    res.status(200).json({ total: data })
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
