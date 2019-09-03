/**
 * Interface between the node server and the sensors.
 */
const Raspistill = require('node-raspistill').Raspistill
const camera = new Raspistill({ time: 250, outputDir: './measure' })
const spawn = require("child_process").spawn;

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
                    new Promise((resolve, reject) => {
                        const pyprog = spawn('python', ['./measure/calibration.py']);

                        pyprog.stdout.on('data', function (data) {
                            resolve(data);
                        });

                        pyprog.stderr.on('data', (data) => {
                            reject(data);
                        });
                    }).then(() => {
                        resolve("Calibrated.")
                    }).catch((e) => {
                        reject(e)
                    })
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
            camera.takePhoto('measure')
                .then((photo) => {
                    new Promise((resolve, reject) => {
                        const pyprog = spawn('python', ['./measure/measure.py', x, y, z]);

                        pyprog.stdout.on('data', function (data) {
                            let measure = JSON.parse(data);
                            resolve(measure);
                        });

                        pyprog.stderr.on('data', (data) => {
                            reject(data);
                        });
                    }).then(() => {
                        resolve("Calibrated.")
                    }).catch((e) => {
                        reject(e)
                    })
                })
                .catch((error) => {
                    reject("Couldn't take a photo.")
                })
        })
    }
}