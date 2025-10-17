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
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
    // win.webContents.openDevTools()
    win.setAlwaysOnTop(true, 'screen-saver')
    win.setIgnoreMouseEvents(true)
    win.loadFile('index.html')
    windows.push(win)
  })
}


app.whenReady().then(() => {
  createWindows()
  tray = setupTray(windows)
  windows.forEach(w => {
    w.webContents.on('did-finish-load', () => {
      console.log('Window finished loading, sending initial launch-confetti')
      w.webContents.send('launch-confetti')
      console.log('Initial launch-confetti sent')
    })
  })
  setupMqtt(windows, username)
  // setupMqttPublic(windows, username)
})
