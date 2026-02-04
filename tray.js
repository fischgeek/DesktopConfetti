const { app, Tray, Menu } = require('electron')
const fs = require('fs')
const path = require('path')
const { loadConfig, toggleTrigger } = require('./config')

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
        const excludedFiles = [
            'fireworks.json',
            'starburst.json',
            'bottom_corners_shower.json'
        ]
        
        const files = fs
            .readdirSync(samplesDir)
            .filter(f => f.toLowerCase().endsWith('.json'))
            .filter(f => !excludedFiles.includes(f)) // Filter out excluded files

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

    // Load current config
    const config = loadConfig()
    const triggers = config.triggers

    const triggerItems = [
        {
            label: 'Item Completed',
            type: 'checkbox',
            checked: triggers['item-completed'],
            click: () => toggleTrigger('item-completed')
        },
        {
            label: '10 Items Completed',
            type: 'checkbox',
            checked: triggers['ten-items-completed'],
            click: () => toggleTrigger('ten-items-completed')
        },
        {
            label: '20 Items Completed',
            type: 'checkbox',
            checked: triggers['twenty-items-completed'],
            click: () => toggleTrigger('twenty-items-completed')
        },
        {
            label: 'Item Transitioned',
            type: 'checkbox',
            checked: triggers['item-transitioned'],
            click: () => toggleTrigger('item-transitioned')
        },
        {
            label: 'Sprint Completed',
            type: 'checkbox',
            checked: triggers['sprint-completed'],
            click: () => toggleTrigger('sprint-completed')
        }
    ]

    const contextMenu = Menu.buildFromTemplate([
        // {
        //     label: 'Fire Confetti',
        //     click: () =>
        //         windows.forEach(w => {
        //             w.webContents.send('launch-confetti')
        //         })
        // },
        ...(sampleItems.length ? [{ label: 'Confetti Samples', submenu: sampleItems }] : []),
        { type: 'separator' },
        { label: 'Trigger Settings', submenu: triggerItems },
        { type: 'separator' },
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