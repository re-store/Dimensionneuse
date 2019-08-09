/**
 * Interface between the node server and the sensors.
 */
const Raspistill = require('node-raspistill').Raspistill
const camera = new Raspistill({ time: 250, outputDir: './measure' })

module.exports = {
    /**
     * Calibrate the sensors.
     * 
     * @returns {Promise} Calibration promise.
     */
    calibrate: function () {
        return new Promise((resolve, reject) => {
            camera.takePhoto('calib')
                .then((photo) => {
                    resolve("Took a photo.")
                })
                .catch((error) => {
                    reject("Couldn't take a photo.")
                })
        })
    },

    /**
     * Measure a plank and returns its size.
     * 
     * @param {boolean} x Should measure x.
     * @param {boolean} y Should measure y.
     * @param {boolean} z Should measure z.
     * @returns {Promise} Measure promise.
     */
    measure: function (x, y, z) {
        return new Promise((resolve, reject) => {
            let dim = { "x": 100, "y": 50, "z": 10 }
	    camera.takePhoto('measure')
                .then((photo) => {
                    resolve(dim)
                })
                .catch((error) => {
                    reject("Couldn't take a photo.")
                })
        })
    }
}