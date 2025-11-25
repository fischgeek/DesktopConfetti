const { app, BrowserWindow, screen, Tray, Menu, ipcMain } = require('electron')
// const express = require('express')
const { setupTray } = require('./tray')
const path = require('path')
const { setupMqtt, setupMqttPublic, sendCheckIn } = require('./mqtt.js')
// const mqtt = require('mqtt')
// const serverApp = express()
const os = require('os')
const username = os.userInfo().username
let tray = null
let windows = []
console.log('Current user:', username)

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  console.log('Another instance is already running. Exiting...')
  app.quit()
} else {
  // Handle when user tries to open a second instance
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('Second instance attempted, focusing existing windows')
    // Focus existing windows if they exist
    windows.forEach(win => {
      if (win) {
        if (win.isMinimized()) win.restore()
        win.focus()
      }
    })
  })
}

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
      focusable: false,
      resizable: false,
      minimizable: false,
      closable: false,
      icon: getWindowIconPath(),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
    
    // Set the highest possible window level to resist Win+D
    win.setAlwaysOnTop(true, 'screen-saver', 1)
    win.setIgnoreMouseEvents(true)
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    
    win.on('blur', () => {
      setTimeout(() => {
        win.setAlwaysOnTop(true, 'screen-saver', 1)
      }, 100)
    })
    
    win.on('hide', () => {
      win.show()
      win.setAlwaysOnTop(true, 'screen-saver', 1)
    })
    
    win.on('minimize', () => {
      win.restore()
      win.setAlwaysOnTop(true, 'screen-saver', 1)
    })
    
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
  
  // Timer-based always-on-top enforcement every minute
  setInterval(() => {
    windows.forEach(win => {
      if (win && !win.isDestroyed()) {
        win.setAlwaysOnTop(true, 'screen-saver', 1)
        sendCheckIn(username)
      }
    })
  }, 60000)
})

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle app quit properly
app.on('before-quit', () => {
  // Close all windows to ensure clean exit
  windows.forEach(win => {
    if (win && !win.isDestroyed()) {
      win.destroy()
    }
  })
})
