const { Tray, Menu } = require('electron')

function setupTray(windows) {
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
    return tray
}

module.exports = { setupTray }