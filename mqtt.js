const mqtt = require('mqtt')
const mqttConfig = require('./mqtt_config.js')
const mqttConfigPublic = require('./mqtt_config_public.js')
const { loadConfig } = require('./config')

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
    rejectUnauthorized: mqttConfig.rejectUnauthorized
  })

  const itemCompletedTopic = `confetti/${usr}/item-completed`
  const itemTransitionedTopic = `confetti/${usr}/item-transitioned`
  const sprintCompletedTopic = `confetti/${usr}/sprint-completed`


  client.on('connect', () => {
    console.log(`Connected to ${mqttConfig.host}. Subscribing to topics:`, itemCompletedTopic, itemTransitionedTopic, sprintCompletedTopic)
    client.subscribe(itemCompletedTopic)
    client.subscribe(itemTransitionedTopic)
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
    if (t !== itemCompletedTopic && t !== itemTransitionedTopic && t !== sprintCompletedTopic) return

    console.log('Confetti trigger received on topic:', t)
    let confettiOptions = {}

    try {
      confettiOptions = JSON.parse(message.toString())
      console.log('Parsed confetti options:', confettiOptions)
    } catch (e) {
      console.error('Invalid MQTT payload:', e)
    }

    // Load config and check if this trigger type is enabled
    const config = loadConfig()
    let triggerKey
    if (t === itemCompletedTopic) {
      triggerKey = 'item-completed'
    } else if (t === itemTransitionedTopic) {
      triggerKey = 'item-transitioned'
    } else {
      triggerKey = 'sprint-completed'
    }
    
    if (!config.triggers[triggerKey]) {
      console.log('Trigger disabled in config:', triggerKey)
      return
    }

    sendTriggerTimestamp(usr)
    windows.forEach(w => {
      if (w && !w.isDestroyed()) {
        console.log('Sending launch-confetti with options:', confettiOptions)
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

function sendCheckIn(usr) {
  if (!client) return

  const checkInTopic = `confetti/${usr}/check-in`
  const timestamp = new Date().toLocaleString()
  console.log('Publishing sendCheckIn to topic:', checkInTopic)
  client.publish(checkInTopic, timestamp, (err) => {
    if (err) {
      console.error('Failed to publish sendCheckIn:', err)
    } else {
      console.log('sendCheckIn published successfully to:', checkInTopic, 'with timestamp:', timestamp)
    }
  })
}

function sendTriggerTimestamp(usr) {
  if (!client) return

  const triggerTopic = `confetti/${usr}/triggered`
  const timestamp = new Date().toLocaleString()
  console.log('Publishing sendTriggerTimestamp to topic:', triggerTopic)
  client.publish(triggerTopic, timestamp, (err) => {
    if (err) {
      console.error('Failed to publish sendTriggerTimestamp:', err)
    } else {
      console.log('sendTriggerTimestamp published successfully to:', triggerTopic, 'with timestamp:', timestamp)
    }
  })
}

module.exports = { setupMqtt, setupMqttPublic, sendCheckIn, sendTriggerTimestamp }