const confettiLib = require('canvas-confetti')
let confetti
let customShapes = {}

const defaultConfetti = {
    bursts: 1,
    particleCount: 100,
    spread: 150,
    // gravity: 0.8,
    shapes: ['circle', 'square'],
    // colors: ['#bb0000', '#2f00ffff'],
    // decay: 0.9,
    // scalar: 1.2,
    // angle: 90,
    // ticks: 200,
}

function initConfetti(canvas) {
    confetti = confettiLib.create(canvas, { resize: true, useWorker: true })
    const unicorn = confettiLib.shapeFromText({ text: '\uD83E\uDD84' })
    const cloud = confettiLib.shapeFromText({ text: '⛅' })
    const partyPopper = confettiLib.shapeFromText({ text: '\uD83C\uDF89' })
    customShapes = { unicorn, cloud, partyPopper }
}

function parseShapes(shapes) {
    if (!Array.isArray(shapes)) {
        return shapes
    }
    return shapes.map(s => {
        if (/^emoji:/.test(s)) {
            const emoji = s.replace(/^emoji:/, '')
            return confettiLib.shapeFromText({ text: emoji })
        }
        return s
    })
}


function launchConfetti(payload = {}) {
    if (!confetti) return

    // 1. Realistic: { count, defaults, fires: [ { particleRatio, opts } ] }
    if (payload.count && Array.isArray(payload.fires)) {
        const count = payload.count
        const defaults = payload.defaults || {}
        // If fires are in {particleRatio, opts} form
        if (payload.fires.every(f => typeof f.particleRatio === 'number' && f.opts)) {
            payload.fires.forEach(fire => {
                confetti({
                    ...defaultConfetti,
                    ...defaults,
                    ...fire.opts,
                    particleCount: Math.floor(count * fire.particleRatio)
                })
            })
            return
        }
    }

    // 2. Starburst: { defaults, fires: [ { ...opts } ], repeat, repeatDelay }
    if (Array.isArray(payload.fires) && payload.defaults) {
        const defaults = payload.defaults
        const fires = payload.fires
        const repeat = Number.isFinite(payload.repeat) ? payload.repeat : 1
        const repeatDelay = payload.repeatDelay

        const isRange = v => v && typeof v === 'object' && Number.isFinite(v.min) && Number.isFinite(v.max)
        const rnd = (min, max) => Math.random() * (max - min) + min

        const resolveRangesShallow = obj => {
            if (!obj || typeof obj !== 'object') return obj
            const out = { ...obj }
            // Only resolve origin.x / origin.y ranges to keep change minimal
            if (out.origin && typeof out.origin === 'object') {
                const o = { ...out.origin }
                if (isRange(o.x)) o.x = rnd(o.x.min, o.x.max)
                if (isRange(o.y)) o.y = rnd(o.y.min, o.y.max)
                out.origin = o
            }
            return out
        }

        let cumulativeDelay = 0
        for (let i = 0; i < repeat; i++) {
            const interval = Number.isFinite(repeatDelay)
                ? repeatDelay
                : (isRange(repeatDelay) ? rnd(repeatDelay.min, repeatDelay.max) : 100)
            const scheduleAt = cumulativeDelay
            cumulativeDelay += interval

            setTimeout(() => {
                fires.forEach(fireOpts => {
                    const resolved = resolveRangesShallow(fireOpts)
                    confetti({
                        ...defaultConfetti,
                        ...defaults,
                        ...resolved
                    })
                })
            }, scheduleAt)
        }
        return
    }

    // Fallback: single burst
    confetti({ ...defaultConfetti, ...payload })
}

module.exports = { initConfetti, launchConfetti }