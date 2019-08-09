/**
 * Interface between the node server and the database.
 */
var { Pool, Client } = require('pg');

const dbConfig = {
    user: 'pi',
    host: '127.0.0.1',
    database: 're-store',
    password: 'raspberry',
    port: 5432,
}

const pool = new Pool(dbConfig)

const tableName = "dimensionneuse.dimensionneuse"

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
        return new Promise((resolve, reject) => {

            // Parameters validity test
            if (!validate(measure, precision, material, volume, location)) {
                reject("Upload failed! (Incorrect parameters)")
            }

            plankID(measure, precision, material, volume, location) // 1st promise : get plank ID
                .then(id => {

                    const query2 = {
                        text: `INSERT INTO ${tableName}(id, x, y, z, px, py, pz, material, volume, location) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                        values: [id,
                            Number(measure[0]), Number(measure[1]), Number(measure[2]),
                            Number(precision[0]), Number(precision[1]), Number(precision[2]),
                            material, volume, location]
                    }

                    pool
                        .query(query2) // 2nd promise : INSERT query
                        .then(res => resolve("Upload successful, ID " + id))
                        .catch(e => reject("Upload failed! (Couldn't insert in the db)"))
                })
                .catch(e => reject("Upload failed! (Couldn't generate ID)"))

        })
    },

    fetch: function () {
        return new Promise((resolve, reject) => {
            pool
                .query(`SELECT * FROM ${tableName}`)
                .then(res => resolve(res))
                .catch(e => reject("Upload failed! (Couldn't fetch)"))
        })
    }
}

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

/**
 * Returns the plank ID.
 * 
 * @param {Array} measure [x, y, z] measure in mm.
 * @param {Array} precision [x, y, z] precision in mm.
 * @param {String} material
 * @param {String} volume 
 * @param {String} location 
 * @returns {Promise} Promise resolving with the right ID.
 */
function plankID(measure, precision, material, volume, location) {
    return new Promise((resolve, reject) => {
        // SQL query and parameters
        const query = {
            text: `SELECT COUNT(*) FROM ${tableName} WHERE location=$1`,
            values: [location]
        }

        pool
            .query(query)
            .then(res => {
                resolve(location + '-' + (Number(res.rows[0].count) + 1))
            })
            .catch(e => reject("Couldn't generate plankID."))
    })
}