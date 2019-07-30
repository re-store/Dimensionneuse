/**
 * Interface between the node server and the database.
 */
var { Pool, Client } = require('pg');

module.exports = {
    /**
     * Upload a plank to the database.
     * 
     * @param {Array} measure [x, y, z] measure in mm.
     * @param {Array} precision [x, y, z] precision in mm.
     * @param {String} material
     * @param {String} volume 
     * @param {String} location 
     * @returns {Promise} Operation promise.
     */
    upload: function (measure, precision, material, volume, location) {
        return new Promise(function (resolve, reject) {

            // Parameters validity test
            if (!validate(measure, precision, material, volume, location)) {
                reject("Upload failed : incorrect parameters.")
            }

            var client = new Client({
                user: 'dimn',
                host: '127.0.0.1',
                database: 'dimn',
                password: 'Mvtmjs1n',
                port: 5432,
            })

            client.connect()
            console.log("Connected")

            // SQL query
            var text = 'INSERT INTO prototest(x, y, z, material, type, location) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
            var values = [Number(measure[0]), Number(measure[1]), Number(measure[2]), material, volume, location]

            client.query(text, values, (err, res) => {
                if (err) {
                    reject("Upload failed : database error (database/main.js)")
                } else {
                    resolve("Upload successful.")
                }
            })

        })
    }
};

/**
 * Checks if the given parameters are valid.
 * 
 * @param {Array} measure [x, y, z] measure in mm.
 * @param {Array} precision [x, y, z] precision in mm.
 * @param {String} material
 * @param {String} volume 
 * @param {String} location 
 * @returns {boolean} True if the parameters are valid.
 */
function validate(measure, precision, material, volume, location) {
    // Check arrays size
    if (measure.length != 3 || precision.length != 3) {
        return false
    }

    // Size can't be ≤ 0
    if (measure[0] <= 0 || measure[1] <= 0 || measure[2] <= 0 ||
        precision[0] <= 0 || precision[1] <= 0 || precision[2] <= 0) {
        return false
    }

    // Informations can't be empty strings
    if (material == "" || volume == "" || location == "") {
        return false
    }

    return true
}