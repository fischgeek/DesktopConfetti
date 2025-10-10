const mqtt = require('mqtt')
const mqttConfig = require('./mqtt_config.js')

let client = null

function setupMqtt(windows, usr) {
  if (client) return client  // return existing client if already created

  client = mqtt.connect({
    protocol: mqttConfig.protocol,
    host: mqttConfig.host,
    port: mqttConfig.port,
    username: mqttConfig.username,
    password: mqttConfig.password,
    rejectUnauthorized: true
  })

  const topic = `confetti/${username}`

  client.on('connect', () => {
    console.log(`Connected to ${mqttConfig.host}. Subscribing to topic:`, topic)
    client.subscribe(topic)
  })

  client.on('error', err => console.error('MQTT Connection Error:', err))

  client.on('message', (t, message) => {
    if (t !== topic) return

    console.log('Confetti trigger received')
    let confettiOptions = {}

    try {
      confettiOptions = JSON.parse(message.toString())
      console.log('Parsed confetti options:', confettiOptions)
    } catch (e) {
      console.error('Invalid MQTT payload:', e)
    }

    windows.forEach(w => {
      if (w && !w.isDestroyed()) {
        w.webContents.send('launch-confetti', confettiOptions)
      }
    })
  })

  return client
}

module.exports = { setupMqtt }