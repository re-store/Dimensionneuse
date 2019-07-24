/**
 * This is the server code.
 */

const express = require('express')
const app = express()
const port = 3000
var ip = require('ip')

app.listen(port, () => console.log(`La Dimensionneuse is running !\n↳  On this computer : http://localhost:${port}\n↳  Remote access : http://${ip.address()}:3000`))
app.use(express.urlencoded({ extended: true }))

// Served files
app.use(express.static('public'))
app.use('/node_modules', express.static('node_modules'))
app.use('/config', express.static('../config'))

// GET & POST requests
app.get('/measure', function (req, res) {
    console.log(req.query)
    res.send('Measure :')
})

app.post('/calibrate', function (req, res) {
    setTimeout(function () {
        res.send("The camera is calibrated")
    }, 2000)
})

app.post('/upload', function (req, res) {
    console.log(req.body)
    res.send("Upload successful : code DIM-0123")
})