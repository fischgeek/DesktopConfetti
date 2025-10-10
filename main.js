const { app, BrowserWindow, screen, Tray, Menu, ipcMain } = require('electron')
// const express = require('express')
const path = require('path')
const { setupMqtt } = require('./mqtt.js')
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
    
    win.setAlwaysOnTop(true, 'screen-saver')
    win.setIgnoreMouseEvents(true)
    win.loadFile('index.html')
    windows.push(win)
  })
}

app.whenReady().then(() => {
  tray = new Tray('confetti.png')
  const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Fire Confetti',
    click: () => 
      windows.forEach(w => {
        w.webContents.send('launch-confetti')
      })
    },
    { label: 'Quit', click: () => app.quit() }
  ])
  tray.setToolTip('Confetti App')
  tray.setContextMenu(contextMenu)
  createWindows()
  windows.forEach(w => {
    w.webContents.on('did-finish-load', () => {
      w.webContents.send('launch-confetti')
    })
  })
  setupMqtt(windows, username)
})
