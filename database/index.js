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

    /**
     * Returns the filtered database items.
     * 
     * @param {Boolean} available Fetch available items
     * @param {Boolean} removed Fetch removed items
     * @param {String} location Wanted location ("ANY" for all)
     * @param {Array} x ["ANY" / "LT"(<) / "MT"(>) / "BTW"(<&>), first number, second number]
     * @param {Array} y Same as x (["LT", 50] means y ≤ 50)
     * @param {Array} z Same as x (["BTW", 40, 100] means 40 ≤ z ≤ 100)
     * @param {String} material Wanted material ("ANY" for all)
     * @param {String} volume Wanted volume ("ANY" for all)
     * @param {String} order "ASC" / "DESC"
     * @param {String} by The field used to order results
     */
    fetch: function (available, removed, location, x, y, z, material, volume, order, by) {

        // Computes the condition
        var query = `SELECT * FROM ${tableName}`
        var cond = 'WHERE '
        var conditions = []
        var bad = false
        var order = `ORDER BY ${by} ${order}`

        // Alive filter
        if (available === "true" && removed === "false") {
            conditions.push("alive = true")
        } else if (available === "false" && removed === "true") {
            conditions.push("alive = false")
        } else if (available === "false" && removed === "false") {
            bad = true
        }

        // Location, volume, material
        if (location != "ANY") {
            conditions.push("location = " + location)
        }
        if (volume != "ANY") {
            conditions.push("volume = " + volume)
        }
        if (material != "ANY") {
            conditions.push("material = " + material)
        }

        // Size filtering
        var dim = [x, y, z]
        var variables = ["x", "y", "z"]
        for (let i = 0; i < dim.length; i++) {
            switch (dim[i][0]) {
                case "LT":
                    conditions.push(variables[i] + " <= " + dim[i][1])
                    if (dim[i][1].length == 0) {
                        bad = true
                    }
                    break;
                case "MT":
                    conditions.push(variables[i] + " >= " + dim[i][1])
                    if (dim[i][1].length == 0) {
                        bad = true
                    }
                    break;
                case "BTW":
                    conditions.push(variables[i] + " >= " + dim[i][1])
                    conditions.push(variables[i] + " <= " + dim[i][2])
                    if (dim[i][1].length == 0 || dim[i][2].length == 0) {
                        bad = true
                    }
                    break;
                default:
                    break;
            }
        }

        // Builds the condition
        if (conditions.length == 0) {
            cond = ""
        } else {
            cond = "WHERE " + conditions.join(" AND ")
        }

        return new Promise((resolve, reject) => {
            if (bad) {
                reject("Wrong filters.")
            }
            pool
                .query(`SELECT * FROM ${tableName}`)
                .then(res => resolve(res))
                .catch(e => reject("Upload failed! (" + e + ")"))
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