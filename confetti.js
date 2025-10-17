const confettiLib = require('canvas-confetti')
let myConfetti
let customShapes = {}

const defaultConfetti = {
    bursts: 1,
    particleCount: 100,
    spread: 70,
    // gravity: 0.8,
    shapes: ['circle', 'square'],
    // colors: ['#bb0000', '#2f00ffff'],
    // decay: 0.9,
    // scalar: 1.2,
    // angle: 90,
    // ticks: 200,
}

function initConfetti(canvas) {
    myConfetti = confettiLib.create(canvas, { resize: true, useWorker: true })
    const unicorn = confettiLib.shapeFromText({ text: '\uD83E\uDD84' })
    const cloud = confettiLib.shapeFromText({ text: '⛅' })
    const partyPopper = confettiLib.shapeFromText({ text: '\uD83C\uDF89' })
    customShapes = { unicorn, cloud, partyPopper }
}

function parseShapes(shapes) {
    if (!Array.isArray(shapes)) return shapes
    return shapes.map(s => {
        if (/^emoji:/.test(s)) {
            const emoji = s.replace(/^emoji:/, '')
            return confettiLib.shapeFromText({ text: emoji })
        }
        return s
    })
}

function launchConfetti(config = {}) {
    console.log('launchConfetti called with config:', config)
    if (!myConfetti) return

    console.log('Launching confetti with config:', config)

    const fire = conf => {
        const parsed = { ...defaultConfetti, ...conf }
        if (Array.isArray(parsed.shapes)) parsed.shapes = parseShapes(parsed.shapes)
        console.log('go')
        myConfetti(parsed)
        console.log('Confetti fired with config:', parsed)
    }

    config = { ...defaultConfetti, ...config }
    if (Array.isArray(config.fires)) {
        console.log('Multiple fire configs')
        config.fires.forEach(fire)
    } else {
        console.log('Single fire config')
        fire(config)
    } 
}

module.exports = { initConfetti, launchConfetti }