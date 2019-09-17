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

app.get('/fetch', function (req, res) {
    database.fetch(req.query.available, req.query.removed, req.query.location,
        [req.query.x, req.query.xNum, req.query.xNum2],
        [req.query.y, req.query.yNum, req.query.yNum2],
        [req.query.z, req.query.zNum, req.query.zNum2],
        req.query.material, req.query.volume,
        req.query.order, req.query.by)
        .then(value => {
            res.send(value)
        })
        .catch(value => {
            res.send(value)
        })
})

app.get('/fetchAvailable', function (req, res) {
    database.fetchAvailable()
        .then(value => {
            let csv = ""
            for (let i = -1; i < value.rows.length; i++) {
                let line = ""
                for (property in value.rows[0]) {
                    if (i >= 0) {
                        line += value.rows[i][property] + ","
                    } else {
                        line += property + ","
                    }
                }
                csv += line.slice(0, -1) + ";"
            }
            res.send(csv.slice(0, -1))
        })
        .catch(value => {
            res.send(value)
        })
})

app.get('/reserve', function (req, res) {
    database.reserve(req.query.items)
        .then(value => {
            res.send(value)
        })
        .catch(value => {
            res.send(value)
        })
})

app.post('/edit', (req, res) => {
    database.edit(req.body.id, req.body.to)
        .then(value => {
            res.send(value)
        })
        .catch(value => {
            res.send(value)
        })
})

app.post('/del', (req, res) => {
    database.del(req.body.id)
        .then(value => {
            res.send(value)
        })
        .catch(value => {
            res.send(value)
        })
})