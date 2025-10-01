const express = require('express')
const path = require('path')
const app = express()

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Confetti Test</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
</head>
<body>
    <h1>🎉 Confetti triggered!</h1>
    <button onclick="launchConfetti()">Click me for confetti</button>
    <script>
        function launchConfetti() {
            confetti({
                particleCount: 200,
                spread: 80,
                origin: { y: 0.6 }
            })
        }
        // Auto-fire on page load
        launchConfetti()
    </script>
</body>
</html>
    `)
})

app.listen(5000, () => {
    console.log('Server running at http://localhost:5000')
})
