/**
 * Interface between the node server and the sensors.
 */

module.exports = {
    /**
     * Calibrate the sensors.
     * 
     * @returns {Promise} Calibration promise.
     */
    calibrate: function () {
        return new Promise(function(resolve, reject) {
            resolve("Calibrated.")
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
        return new Promise(function(resolve, reject) {
            let dim = {"x": 0, "y": 0, "z": 0}
            resolve(dim)
        })
    }
};