/**
 * Interface between the node server and the database.
 */

module.exports = {
    /**
     * Upload a plank to the database.
     * 
     * @param {Array} measure [x, y, z] measure in mm.
     * @param {Array} precision [x, y, z] precision in mm.
     * @param {String} material
     * @param {String} volume 
     * @param {String} location 
     * @returns {String} Log the operation.
     */
    upload: function (measure, precision, material, volume, location) {
        return "Upload successful."
    }
};