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
    customShapes = { pumpkin, unicorn, cloud, partyPopper }
}

function resolveRandomValues(obj) {
    const resolved = {}
    for (const key in obj) {
        const val = obj[key]
        if (val && typeof val === 'object' && typeof val.min === 'number' && typeof val.max === 'number') {
            resolved[key] = Math.random() * (val.max - val.min) + val.min
        } else {
            resolved[key] = val
        }
    }
    return resolved
}

function fireConfettiSequence(config) {
    const count = config.count || 200
    const defaults = config.defaults || {}
    if (!Array.isArray(config.fires)) return

    config.fires.forEach(fire => {
        const particleCount = Math.floor(count * (fire.particleRatio || 1))
        const resolvedOpts = resolveRandomValues(fire.opts || {})

        // Parse shapes for emojis
        if (Array.isArray(resolvedOpts.shapes)) {
            resolvedOpts.shapes = resolvedOpts.shapes.map(s => {
                if (customShapes[s]) return customShapes[s]
                if (/^emoji:/.test(s)) {
                    const emoji = s.replace(/^emoji:/, '')
                    return confettiLib.shapeFromText({ text: emoji })
                }
                return s
            })
        }

        myConfetti({
            ...defaults,
            ...resolvedOpts,
            particleCount
        })
    })
}

function launchConfetti(customOptions = {}) {
    if (!myConfetti) return

    if (customOptions.mode === 'multi' && Array.isArray(customOptions.fires)) {
        fireConfettiSequence(customOptions)
        return
    }

    const config = { ...defaultConfetti, ...customOptions }
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
                origin: config.origin ||
                    { x: Math.random(), y: Math.random() * 0.5 }
            })
        }, i * (config.burstDelay || 200))
    }
}

module.exports = { initConfetti, launchConfetti }