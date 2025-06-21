const express = require('express')
const path = require('path')
const { get } = require('request')
const dotenv = require('dotenv')
dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const viewsDir = path.join(__dirname, 'views')
app.use(express.static(viewsDir))
app.use(express.static(path.join(__dirname, './public')))

// app.get('/', (req, res) => res.sendFile('index.html'))
app.get('/', (req, res) => res.sendFile(path.join(viewsDir, 'index.html')))
app.get('/scan', (req, res) => res.sendFile(path.join(viewsDir, 'scan.html')))
app.get('/generating', (req, res) => res.sendFile(path.join(viewsDir, 'generating.html')))
app.get('/receive', (req, res) => res.sendFile(path.join(viewsDir, 'receive.html')))
app.get('/face-scan', (req, res) => res.sendFile(path.join(viewsDir, 'face-scan.html')))
app.get('/success', (req, res) => res.sendFile(path.join(viewsDir, 'success.html')))
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));

function request(url, returnBuffer = true, timeout = 10000) {
  return new Promise(function(resolve, reject) {
    const options = Object.assign(
      {},
      {
        url,
        isBuffer: true,
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
      },
      returnBuffer ? { encoding: null } : {}
    )

    get(options, function(err, res) {
      if (err) return reject(err)
      return resolve(res)
    })
  })
}