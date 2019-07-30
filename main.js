/**
 * This is the server code.
 */

const express = require('express')
const app = express()
const port = 3000
var ip = require('ip')
var measure = require('./measure')
var database = require('./database')

app.listen(port, () => console.log(`La Dimensionneuse is running !\n->  On this computer : http://localhost:${port}\n->  Remote access : http://${ip.address()}:3000`))
app.use(express.urlencoded({ extended: true }))

// Served files
app.use(express.static('website'))
app.use('/node_modules', express.static('node_modules'))
app.use('/config', express.static('config'))

// GET & POST requests
app.get('/measure', function (req, res) {
    measure.measure(req.query.x, req.query.y, req.query.z)
        .then(value => {
            res.send(value)
        })
        .catch(value => {
            res.send(value)
        })
})

app.post('/calibrate', (_req, res) => {
    measure.calibrate()
        .then(value => {
            res.send(value)
        })
        .catch(value => {
            res.send(value)
        })
})

app.post('/upload', (req, res) => {
    database.upload(req.body.measure, req.body.precision, req.body.mat, req.body.vol, req.body.loc)
        .then(value => {
            res.send(value)
        })
        .catch(value => {
            res.send(value)
        })
})