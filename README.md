# DesktopConfetti

DesktopConfetti is a cross-platform Electron app that displays confetti overlays on your desktop, triggered by MQTT messages or tray menu actions. Great for celebrations, notifications, or just for fun!

## Features
- Full-screen confetti overlay on all monitors
- MQTT integration: trigger confetti remotely
- Tray menu: fire confetti samples and restart app
- Customizable payloads (realistic, starburst, corner bursts, fireworks)
- Windows, macOS, and Linux support

## Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/fischgeek/desktop-confetti.git
   cd desktop-confetti
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run in development:
   ```sh
   npm start
   ```
4. Build installers:
   ```sh
   npm run build
   ```
   - Installers will be in the `dist/` folder.

## Usage

### Tray Menu
- Click the tray icon to open the menu.
- Select a sample to fire confetti with different effects.
- Use "Restart App" to relaunch the app.

### MQTT Trigger
- Publish a JSON payload to the topic `confetti/<username>` (where `<username>` is your Windows username).
- Example using [MQTT Explorer](https://mqtt-explorer.com/) or `mosquitto_pub`:

#### Simple burst
```json
{
  "particleCount": 120,
  "spread": 80,
  "angle": 135,
  "origin": { "x": 1, "y": 0 },
  "startVelocity": 60,
  "shapes": ["circle", "square"]
}
```

#### Realistic burst
```json
{
  "count": 200,
  "defaults": { "origin": { "y": 0.7 } },
  "fires": [
    { "particleRatio": 0.25, "opts": { "spread": 26, "startVelocity": 55 } },
    { "particleRatio": 0.2, "opts": { "spread": 60 } },
    { "particleRatio": 0.35, "opts": { "spread": 100, "decay": 0.91, "scalar": 0.8 } },
    { "particleRatio": 0.1, "opts": { "spread": 120, "startVelocity": 25, "decay": 0.92, "scalar": 1.2 } },
    { "particleRatio": 0.1, "opts": { "spread": 120, "startVelocity": 45 } }
  ]
}
```

#### Fireworks (random positions/times)
```json
{
  "defaults": {
    "spread": 360,
    "ticks": 80,
    "gravity": 0.5,
    "decay": 0.92,
    "startVelocity": 45,
    "colors": ["#FF4B4B", "#FFD93D", "#6BCB77", "#4D96FF", "#B084CC"]
  },
  "fires": [
    { "particleCount": 70, "scalar": 0.9, "shapes": ["star"],   "origin": { "x": {"min": 0.15, "max": 0.85}, "y": {"min": 0.10, "max": 0.35} } },
    { "particleCount": 30, "scalar": 0.5, "shapes": ["circle"], "origin": { "x": {"min": 0.15, "max": 0.85}, "y": {"min": 0.10, "max": 0.35} } }
  ],
  "repeat": 8,
  "repeatDelay": { "min": 150, "max": 600 }
}
```

## Customization
- Add new sample payloads to the `samples/` folder; they will appear in the tray menu after restart.
- Change the tray/app icon by replacing files in `assets/`.

## Building for Distribution
- Windows: NSIS installer (`.exe`)
- macOS: DMG
- Linux: AppImage
- All icons are set via `assets/confetti.*` (PNG, ICO, ICNS)

## License
MIT
