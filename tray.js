const { app, Tray, Menu } = require('electron')
const fs = require('fs')
const path = require('path')

function getTrayIconPath() {
    let iconPath = path.join(app.getAppPath(), 'assets', 'confetti.png');
    if (iconPath.includes('app.asar')) {
        iconPath = iconPath.replace('app.asar', 'app.asar.unpacked');
    }
    return iconPath;
}

function setupTray(windows) {
    const iconPath = getTrayIconPath();
    const tray = new Tray(iconPath);

    // Build Samples submenu from ./samples/*.json
    const samplesDir = path.join(__dirname, 'samples')
    let sampleItems = []
    try {
        const files = fs
            .readdirSync(samplesDir)
            .filter(f => f.toLowerCase().endsWith('.json'))

        const toTitle = (name) => name.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

        sampleItems = files.map(file => {
            const label = toTitle(path.basename(file, '.json'))
            const filePath = path.join(samplesDir, file)
            return {
                label,
                click: () => {
                    try {
                        const raw = fs.readFileSync(filePath, 'utf8')
                        const payload = JSON.parse(raw)
                        windows.forEach(w => {
                            if (w && !w.isDestroyed()) {
                                w.webContents.send('launch-confetti', payload)
                            }
                        })
                    } catch (e) {
                        console.error('Failed to load sample', filePath, e)
                    }
                }
            }
        })
    } catch (e) {
        console.error('Unable to build Samples menu:', e)
    }

    const contextMenu = Menu.buildFromTemplate([
        // {
        //     label: 'Fire Confetti',
        //     click: () =>
        //         windows.forEach(w => {
        //             w.webContents.send('launch-confetti')
        //         })
        // },
        ...(sampleItems.length ? [{ label: 'Confetti', submenu: sampleItems }] : []),
        {
            label: 'Restart App',
            click: () => {
                // Relaunch the Electron app with the same arguments
                app.relaunch()
                app.exit(0)
            }
        },
        { label: 'Quit', click: () => app.quit() }
    ])
    tray.setToolTip('Confetti App')
    tray.setContextMenu(contextMenu)
    return tray
}

module.exports = { setupTray }