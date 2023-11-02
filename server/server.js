const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: {
    origin: '*'
  }
})
const { exec } = require('child_process')
const { join } = require('path')
const osu = require('node-os-utils')
const fs = require('fs')
const log4js = require('log4js')
log4js.configure({
  appenders: {
    out: { type: 'console' },
    app: { type: 'file', filename: 'logs/server.log' }
  },
  categories: { default: { appenders: ['out', 'app'], level: 'all' } }
})
const logger = log4js.getLogger()

const { port, password } = require('./config')

app.use(express.static(join(__dirname + '/../client/public')))
app.get('/', (req, res) =>
  res.sendFile(join(__dirname + '/../client/public/pages/interface.html'))
)

//Send OS stats to each connected client
setInterval(async () => {
  const cpuUsage = await osu.cpu.usage()
  const upTime = await osu.os.uptime()
  const memory = await osu.mem.info()
  io.emit('os-info', { cpuUsage, upTime, memory })
}, 1000)

// Incomming Sockets
io.on('connection', async socket => {
  let currDir = '/'

  socket.on('disconnect', () => {
    logger.debug(`Disconnect from ${socket.handshake.address}`)
  })
  logger.debug('New connection from', socket.handshake.address)

  socket.on('ping', () => socket.emit('pong'))

  socket.on('shutdown', pw => {
    if (pw !== password)
      return logger.error(`Shutdown failed: Wrong Password ${pw}`)
    exec('halt', (err, stdout, stderr) => {
      logger.warn('Shutting down...')
      if (err) return console.log(err)
    })
  })
  socket.on('reboot', pw => {
    if (pw !== password)
      return logger.error(`Reboot failed: Wrong Password ${pw}`)
    exec('sudo reboot', (err, stdout, stderr) => {
      logger.warn('Rebooting...')
      if (err) return console.log(err)
    })
  })

  // File Manager
  socket.on('read-dir', async folder => {
    if (!folder) return socket.emit('dir-items', await readDir(currDir))
    const newDir = currDir.endsWith('/')
      ? `${currDir}${folder}`
      : `${currDir}/${folder}`
    socket.emit('dir-items', await readDir(newDir))
    currDir = newDir
  })

  socket.on('prev-dir', async () => {
    const newPath = currDir.substr(0, currDir.lastIndexOf('/'))
    socket.emit('dir-items', await readDir(newPath))
    currDir = newPath
  })

  socket.on('edit-file', async fileName => {
    logger.debug('Edit file' + fileName)
    socket.emit('file-content', await readFile(`${currDir}/${fileName}`))
  })

  socket.on('download-file', async fileName => {
    logger.debug('Downloading: ' + fileName)
    await fs.copyFileSync(
      `${currDir}/${fileName}`,
      join(__dirname + `/../client/public/download/${fileName}`)
    )
    logger.debug('Copied file:' + fileName)
    socket.emit('download-start', `/download/${fileName}`)
  })
})

// Start Web/Socekt-server
http.listen(port, () => logger.debug('Webserver started @' + port))

// File System
async function readDir(path) {
  logger.debug('Navigating to' + path)
  if (path === '') path = '/'
  try {
    const files = await fs.readdirSync(path, { withFileTypes: true })
    let filesPrep = []
    await files.map(file =>
      filesPrep.push({
        name: file.name,
        isFile: file.isFile()
      })
    )
    return filesPrep
  } catch (err) {
    logger.error(err)
    return []
  }
}

async function readFile(dir) {
  try {
    return await fs.readFileSync(dir, 'utf8')
  } catch (err) {
    logger.error(err)
    return
  }
}
