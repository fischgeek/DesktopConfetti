const fs = require('fs')
const path = require('path')
const { app } = require('electron')

const CONFIG_FILE = path.join(app.getPath('userData'), 'confetti-config.json')

const DEFAULT_CONFIG = {
  triggers: {
    'item-completed': true,
    'ten-items-completed': true,
    'twenty-items-completed': true,
    'sprint-completed': true,
    'item-transitioned': true
  }
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8')
      const loaded = JSON.parse(data)
      // Merge with defaults to ensure all keys exist
      return {
        triggers: {
          ...DEFAULT_CONFIG.triggers,
          ...loaded.triggers
        }
      }
    }
  } catch (e) {
    console.error('Error loading config:', e)
  }
  return DEFAULT_CONFIG
}

function saveConfig(config) {
  try {
    const dir = path.dirname(CONFIG_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8')
    console.log('Config saved:', CONFIG_FILE)
  } catch (e) {
    console.error('Error saving config:', e)
  }
}

function toggleTrigger(triggerName) {
  const config = loadConfig()
  if (config.triggers.hasOwnProperty(triggerName)) {
    config.triggers[triggerName] = !config.triggers[triggerName]
    saveConfig(config)
  }
  return config
}

function getTriggerState(triggerName) {
  const config = loadConfig()
  return config.triggers[triggerName] ?? DEFAULT_CONFIG.triggers[triggerName]
}

module.exports = {
  loadConfig,
  saveConfig,
  toggleTrigger,
  getTriggerState,
  DEFAULT_CONFIG
}
