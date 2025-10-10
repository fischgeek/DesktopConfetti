const confettiLib = require('canvas-confetti')

let myConfetti
let customShapes = {}

// const defaultConfig = {
//     bursts: 3,
//     particleCount: 100,
//     spread: 100,
//     gravity: 0.8,
//     shapes: ['circle', 'square'],
//     decay: 0.9,
//     scalar: 1.2,
//     angle: 90,
//     ticks: 200,
// }
const defaultConfig = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
}

function initConfetti(canvas) {
    myConfetti = confettiLib.create(canvas, { resize: true, useWorker: true })

    const pumpkin = confettiLib.shapeFromPath({
        path: 'M449.4 142c-5 0-10 .3-15 1a183 183 0 0 0-66.9-19.1V87.5a17.5 17.5 0 1 0-35 0v36.4a183 183 0 0 0-67 19c-4.9-.6-9.9-1-14.8-1C170.3 142 105 219.6 105 315s65.3 173 145.7 173c5 0 10-.3 14.8-1a184.7 184.7 0 0 0 169 0c4.9.7 9.9 1 14.9 1 80.3 0 145.6-77.6 145.6-173s-65.3-173-145.7-173zm-220 138 27.4-40.4a11.6 11.6 0 0 1 16.4-2.7l54.7 40.3a11.3 11.3 0 0 1-7 20.3H239a11.3 11.3 0 0 1-9.6-17.5zM444 383.8l-43.7 17.5a17.7 17.7 0 0 1-13 0l-37.3-15-37.2 15a17.8 17.8 0 0 1-13 0L256 383.8a17.5 17.5 0 0 1 13-32.6l37.3 15 37.2-15c4.2-1.6 8.8-1.6 13 0l37.3 15 37.2-15a17.5 17.5 0 0 1 13 32.6zm17-86.3h-82a11.3 11.3 0 0 1-6.9-20.4l54.7-40.3a11.6 11.6 0 0 1 16.4 2.8l27.4 40.4a11.3 11.3 0 0 1-9.6 17.5z',
        matrix: [0.02049, 0, 0, 0.02049, -7.17, -5.9]
    })
    const unicorn = confettiLib.shapeFromText({ text: '🦄' })
    const cloud = confettiLib.shapeFromText({ text: '⛅' })
    const partyPopper = confettiLib.shapeFromText({ text: '🎉' })

    customShapes = { pumpkin, unicorn, cloud, partyPopper }
}

function launchConfetti(options = {}) {
    if (!myConfetti) return
    const config = { ...defaultConfig, ...options }

    if (Array.isArray(config.shapes)) {
        config.shapes = config.shapes.map(s => {
            if (customShapes[s]) return customShapes[s]
            if (/^emoji:/.test(s)) {
                const emoji = s.replace(/^emoji:/, '')
                return confettiLib.shapeFromText({ text: emoji })
            }
            return s
        })
    }

    for (let i = 0; i < config.bursts; i++) {
        setTimeout(() => {
            myConfetti({
                ...config,
                origin: config.origin || { x: Math.random(), y: Math.random() * 0.5 },
            })
        }, i * 200)
    }
}

function startConfetti(options) {
    launchConfetti(options)
}

module.exports = { initConfetti, startConfetti }
