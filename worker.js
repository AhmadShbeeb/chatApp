const { parentPort, workerData } = require('worker_threads')

console.log(workerData)
let total = 0
for (let i = 0; i < 9999999991; i += 5) {
  total++
}

parentPort.postMessage(total)
