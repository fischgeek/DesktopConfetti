const { app, BrowserWindow, screen, Tray, Menu, ipcMain } = require('electron')
// const express = require('express')
const { setupTray } = require('./tray')
const path = require('path')
const { setupMqtt, setupMqttPublic } = require('./mqtt.js')
// const mqtt = require('mqtt')
// const serverApp = express()
const os = require('os')
const username = os.userInfo().username
let tray = null
let windows = []
console.log('Current user:', username)

function createWindows() {
  const displays = screen.getAllDisplays()

  displays.forEach((display) => {
    const getWindowIconPath = () => {
      const file = process.platform === 'win32'
        ? 'confetti.ico'
        : process.platform === 'darwin'
          ? 'confetti.icns'
          : 'confetti.png'
      const p = path.join(app.getAppPath(), 'assets', file)
      return p.includes('app.asar') ? p.replace('app.asar', 'app.asar.unpacked') : p
    }
    const win = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      fullscreen: true,
      icon: getWindowIconPath(),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
    win.setAlwaysOnTop(true, 'screen-saver')
    win.setIgnoreMouseEvents(true)
    // win.webContents.openDevTools()
    // win.setBackgroundColor('black')
    win.loadFile('index.html')
    windows.push(win)
  })
}


app.whenReady().then(() => {
  // Ensure Windows uses our appId for taskbar grouping and icon
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.desktop-confetti')
  }
  createWindows()
  tray = setupTray(windows)
    
  windows.forEach(w => {
    w.webContents.on('did-finish-load', () => {
      console.log('Window finished loading.')
    })
  })

  setupMqtt(windows, username)
  // setupMqttPublic(windows, username)
})
