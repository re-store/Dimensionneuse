/**
 * Interface between the node server and the sensors.
 */

module.exports = {
    /**
     * Calibrate the sensors.
     * 
     * @returns {String} Log the operation.
     */
    calibrate: function () {
        return "Calibrated."
    },

    /**
     * Measure a plank and returns its size.
     * 
     * @param {boolean} x Should measure x.
     * @param {boolean} y Should measure y.
     * @param {boolean} z Should measure z.
     * @returns {Object} The result of the measure.
     */
    measure: function (x, y, z) {
        let dim = {"x": 0, "y": 0, "z": 0}
        return dim
    }
};