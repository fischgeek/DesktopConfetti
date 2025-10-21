const mqtt = require('mqtt')
const mqttConfig = require('./mqtt_config.js')
const mqttConfigPublic = require('./mqtt_config_public.js')

let client = null
let client2 = null

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

  const itemCompletedTopic = `confetti/${usr}/item-completed`
  const sprintCompletedTopic = `confetti/${usr}/sprint-completed`


  client.on('connect', () => {
    console.log(`Connected to ${mqttConfig.host}. Subscribing to topics:`, itemCompletedTopic, sprintCompletedTopic)
    client.subscribe(itemCompletedTopic)
    client.subscribe(sprintCompletedTopic)
    
    // Publish check-in message
    const checkInTopic = `confetti/${usr}/check-in`
    const timestamp = new Date().toLocaleString()
    console.log('Publishing check-in to topic:', checkInTopic)
    client.publish(checkInTopic, timestamp, (err) => {
      if (err) {
        console.error('Failed to publish check-in:', err)
      } else {
        console.log('Check-in published successfully to:', checkInTopic, 'with timestamp:', timestamp)
      }
    })
  })

  client.on('error', err => console.error('MQTT Connection Error:', err))
  

  client.on('message', (t, message) => {
    if (t !== itemCompletedTopic && t !== sprintCompletedTopic) return

    console.log('Confetti trigger received')
    let confettiOptions = {}

    try {
      confettiOptions = JSON.parse(message.toString())
      console.log('Parsed confetti options:', confettiOptions)
      // console.log('Random options: ', confettiOptions.fires[0].opts.spread)
    } catch (e) {
      console.error('Invalid MQTT payload:', e)
    }

    windows.forEach(w => {
      if (w && !w.isDestroyed()) {
        console.log('Sending launch-confetti to window with options:', confettiOptions)
        w.webContents.send('launch-confetti', confettiOptions)
      }
    })
  })

  return client
}

function setupMqttPublic(windows, usr) {
  // const topic = `confetti/${usr}`
  const topic = '75b0fb2a502c513bdcd2ba9c5802a3b4/confetti'
  client2 = mqtt.connect({
    protocol: mqttConfigPublic.protocol,
    host: mqttConfigPublic.host,
    port: mqttConfigPublic.port,
    username: mqttConfigPublic.username,
    password: mqttConfigPublic.password,
    rejectUnauthorized: true
  })
  client2.on('connect', () => {
    console.log(`Connected to ${mqttConfigPublic.host}. Subscribing to topic:`, topic)
    client2.subscribe(topic)
  })
  client2.on('error', err => console.error('MQTT Connection Error:', err))
  client2.on('message', (t, message) => {
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
  return client2
}

module.exports = { setupMqtt, setupMqttPublic }