const { app, BrowserWindow, screen } = require('electron')
// const express = require('express')
const path = require('path')
const mqtt = require('mqtt')
// const serverApp = express()
const os = require('os')
const username = os.userInfo().username
console.log('Current user:', username)


let win
let windows = []

function createWindows() {
  const displays = screen.getAllDisplays()

  displays.forEach((display) => {
    const win = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      fullscreen: false,          // use bounds instead
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
    
    win.setIgnoreMouseEvents(true)
    win.loadFile('index.html')
    windows.push(win)
  })
}
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        fullscreen: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile('index.html')
    win.setIgnoreMouseEvents(true) // let clicks pass through
}


app.whenReady().then(() => {
    // createWindow()
    createWindows()
    windows.forEach(w => {
        w.webContents.on('did-finish-load', () => {
            w.webContents.send('launch-confetti')
        })
    })
    
    // MQTT connection (TLS, port 8883)
    const mqttConfig = require('./mqtt_config.js') // should export { host, port, username, password }

    const client = mqtt.connect({
        protocol: 'mqtts',
        host: mqttConfig.host,
        port: mqttConfig.port,
        username: mqttConfig.username,
        password: mqttConfig.password,
        rejectUnauthorized: true
    })
    
    client.on('error', err => {
       console.error('MQTT Connection Error:', err)
    })

    const topic = `confetti/${username}`
    client.on('connect', () => {
      console.log('Connected securely to HiveMQ')
      client.subscribe(topic)
    })
    
    client.on('message', (t, message) => {
      if (t === topic) {
        console.log('Confetti trigger received')
        // if (win) win.webContents.send('launch-confetti')
        windows.forEach(w => {
            if (w && !w.isDestroyed()) {
                w.webContents.send('launch-confetti')
            }
        })
      }
    })

    // serverApp.get('/confetti', (req, res) => {
    //     if (win) {
    //         win.webContents.send('launch-confetti')
    //     }
    //     res.send('Confetti triggered!')
    // })

    // serverApp.listen(5000, () => console.log('Listening on http://localhost:5000/confetti'))
})
